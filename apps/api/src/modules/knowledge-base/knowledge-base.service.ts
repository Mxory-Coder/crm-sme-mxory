import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { getOpenAI } from '@sme/ai';
import { KnowledgeBaseChunk } from './knowledge-base-chunk.entity';

export interface AddChunkDto {
  content: string;
  agentId?: string;
  sourceType?: string;
  category?: string;
  priority?: number;
  sourceUrl?: string;
  sourceFilename?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  category: string;
  priority: number;
}

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectRepository(KnowledgeBaseChunk) private readonly chunkRepo: Repository<KnowledgeBaseChunk>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Embed text via OpenAI ────────────────────────────────────────────────
  async embed(text: string): Promise<number[]> {
    const openai = getOpenAI();
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim().substring(0, 8000), // max token guard
    });
    return res.data[0].embedding;
  }

  // ─── Add a single chunk ───────────────────────────────────────────────────
  async addChunk(locationId: string, dto: AddChunkDto): Promise<KnowledgeBaseChunk> {
    let embedding: number[] | null = null;
    try {
      embedding = await this.embed(dto.content);
    } catch (err) {
      this.logger.warn(`Embedding failed, storing without vector: ${(err as Error).message}`);
    }

    const chunk = this.chunkRepo.create({
      locationId,
      agentId: dto.agentId ?? null,
      content: dto.content,
      embedding,
      sourceType: dto.sourceType ?? 'MANUAL',
      category: dto.category ?? 'general',
      priority: dto.priority ?? 3,
      sourceUrl: dto.sourceUrl ?? null,
      sourceFilename: dto.sourceFilename ?? null,
      metadata: dto.metadata ?? {},
    });
    return this.chunkRepo.save(chunk);
  }

  // ─── Bulk add Q&A pairs ───────────────────────────────────────────────────
  async addQAPairs(
    locationId: string,
    agentId: string,
    pairs: { q: string; a: string; category?: string; priority?: number }[],
    sourceType = 'FAQ',
  ): Promise<void> {
    for (const pair of pairs) {
      const content = `Q: ${pair.q}\nA: ${pair.a}`;
      await this.addChunk(locationId, {
        content,
        agentId,
        sourceType,
        category: pair.category ?? 'general',
        priority: pair.priority ?? 3,
      });
    }
  }

  // ─── Vector similarity search ─────────────────────────────────────────────
  async search(
    locationId: string,
    query: string,
    topK = 5,
    agentId?: string,
  ): Promise<SearchResult[]> {
    let embedding: number[];
    try {
      embedding = await this.embed(query);
    } catch {
      return []; // embedding unavailable — return empty (non-fatal)
    }

    const embeddingStr = `[${embedding.join(',')}]`;

    const agentFilter = agentId ? `AND agent_id = '${agentId}'` : '';
    const rows: Array<{
      id: string;
      content: string;
      similarity: number;
      category: string;
      priority: number;
    }> = await this.dataSource.query(
      `
      SELECT id, content, category, priority,
             1 - (embedding <=> $1::vector) AS similarity
      FROM knowledge_base_chunks
      WHERE location_id = $2
        AND embedding IS NOT NULL
        ${agentFilter}
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      [embeddingStr, locationId, topK],
    );

    return rows
      .filter((r) => r.similarity > 0.3) // discard low-relevance
      .sort((a, b) => {
        // primary: similarity, secondary: priority for tiebreaking
        const diff = b.similarity - a.similarity;
        return Math.abs(diff) > 0.02 ? diff : b.priority - a.priority;
      });
  }

  // ─── Build context string for Claude system prompt ────────────────────────
  async buildContext(locationId: string, query: string, agentId?: string): Promise<string> {
    const results = await this.search(locationId, query, 5, agentId);
    if (!results.length) return '';
    return `Relevant knowledge:\n${results.map((r) => r.content).join('\n\n')}`;
  }

  // ─── List chunks (paginated) ──────────────────────────────────────────────
  async list(locationId: string, agentId?: string, limit = 50, offset = 0): Promise<KnowledgeBaseChunk[]> {
    const where: Record<string, unknown> = { locationId };
    if (agentId) where['agentId'] = agentId;
    return this.chunkRepo.find({
      where: where as any,
      select: ['id', 'content', 'sourceType', 'category', 'priority', 'sourceUrl', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async deleteChunk(id: string, locationId: string): Promise<void> {
    const chunk = await this.chunkRepo.findOne({ where: { id, locationId } });
    if (!chunk) throw new NotFoundException('Chunk not found');
    await this.chunkRepo.delete(id);
  }

  async countByAgent(locationId: string, agentId: string): Promise<number> {
    return this.chunkRepo.count({ where: { locationId, agentId } });
  }
}
