import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SavedReport } from './agency.entities';
import { getAnthropic, CLAUDE_MODEL } from '@sme/ai';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(SavedReport) private readonly reportRepo: Repository<SavedReport>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Saved Reports ────────────────────────────────────────────────────────

  async findAll(locationId: string): Promise<SavedReport[]> {
    return this.reportRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async create(locationId: string, dto: Partial<SavedReport>, userId: string): Promise<SavedReport> {
    return this.reportRepo.save(this.reportRepo.create({ ...dto, locationId, createdBy: userId }));
  }

  async delete(locationId: string, id: string): Promise<void> {
    await this.reportRepo.delete({ id, locationId });
  }

  // ─── Live Reports ─────────────────────────────────────────────────────────

  async getContactsReport(locationId: string, from: Date, to: Date) {
    const [total, newThisPeriod, bySource] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*) FROM contacts WHERE location_id = $1 AND deleted_at IS NULL`,
        [locationId],
      ),
      this.dataSource.query(
        `SELECT COUNT(*) FROM contacts WHERE location_id = $1 AND created_at BETWEEN $2 AND $3 AND deleted_at IS NULL`,
        [locationId, from, to],
      ),
      this.dataSource.query(
        `SELECT source, COUNT(*) as count FROM contacts WHERE location_id = $1 AND deleted_at IS NULL GROUP BY source ORDER BY count DESC LIMIT 10`,
        [locationId],
      ),
    ]);

    return {
      total: Number(total[0].count),
      newThisPeriod: Number(newThisPeriod[0].count),
      bySource,
    };
  }

  async getConversationsReport(locationId: string, from: Date, to: Date) {
    const [total, byChannel, avgResponseTime] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*) FROM conversations WHERE location_id = $1`,
        [locationId],
      ),
      this.dataSource.query(
        `SELECT type, COUNT(*) as count FROM conversations WHERE location_id = $1 AND created_at BETWEEN $2 AND $3 GROUP BY type`,
        [locationId, from, to],
      ),
      this.dataSource.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (m2.sent_at - m1.sent_at))) as avg_secs
         FROM conversation_messages m1
         JOIN conversation_messages m2 ON m2.conversation_id = m1.conversation_id
           AND m2.direction = 'outbound' AND m2.sent_at > m1.sent_at
         JOIN conversations c ON c.id = m1.conversation_id
         WHERE c.location_id = $1 AND m1.direction = 'inbound'
           AND m1.sent_at BETWEEN $2 AND $3`,
        [locationId, from, to],
      ),
    ]);

    return {
      total: Number(total[0].count),
      byChannel,
      avgResponseTimeSeconds: avgResponseTime[0]?.avg_secs ? Math.round(Number(avgResponseTime[0].avg_secs)) : null,
    };
  }

  async getOpportunitiesReport(locationId: string, from: Date, to: Date) {
    const rows = await this.dataSource.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'open') as open_count,
         COUNT(*) FILTER (WHERE status = 'won') as won_count,
         COUNT(*) FILTER (WHERE status = 'lost') as lost_count,
         SUM(monetary_value) FILTER (WHERE status = 'won' AND updated_at BETWEEN $2 AND $3) as revenue,
         AVG(monetary_value) FILTER (WHERE status = 'open') as avg_deal_size
       FROM opportunities
       WHERE location_id = $1 AND deleted_at IS NULL`,
      [locationId, from, to],
    );

    const row = rows[0];
    const wonCount = Number(row.won_count ?? 0);
    const lostCount = Number(row.lost_count ?? 0);
    const total = wonCount + lostCount;

    return {
      openCount: Number(row.open_count ?? 0),
      wonCount,
      lostCount,
      revenue: Number(row.revenue ?? 0),
      avgDealSize: Number(row.avg_deal_size ?? 0),
      winRate: total > 0 ? Math.round((wonCount / total) * 100) : 0,
    };
  }

  async getAppointmentsReport(locationId: string, from: Date, to: Date) {
    const rows = await this.dataSource.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
         COUNT(*) FILTER (WHERE status = 'attended') as attended,
         COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
         COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
       FROM appointments
       WHERE location_id = $1 AND starts_at BETWEEN $2 AND $3`,
      [locationId, from, to],
    );

    const row = rows[0];
    return {
      scheduled: Number(row.scheduled ?? 0),
      attended: Number(row.attended ?? 0),
      noShow: Number(row.no_show ?? 0),
      cancelled: Number(row.cancelled ?? 0),
    };
  }

  async getFormSubmissionsReport(locationId: string, from: Date, to: Date) {
    const rows = await this.dataSource.query(
      `SELECT f.name, COUNT(fs.id) as submissions
       FROM forms f
       LEFT JOIN form_submissions fs ON fs.form_id = f.id AND fs.created_at BETWEEN $2 AND $3
       WHERE f.location_id = $1
       GROUP BY f.id, f.name
       ORDER BY submissions DESC`,
      [locationId, from, to],
    );
    return rows;
  }

  async getDashboardSummary(locationId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    const [contacts, opportunities, conversations] = await Promise.all([
      this.getContactsReport(locationId, thirtyDaysAgo, now),
      this.getOpportunitiesReport(locationId, thirtyDaysAgo, now),
      this.getConversationsReport(locationId, thirtyDaysAgo, now),
    ]);

    return { contacts, opportunities, conversations, period: { from: thirtyDaysAgo, to: now } };
  }

  // ─── AI Narrative Report ──────────────────────────────────────────────────

  async aiNarrativeReport(locationId: string): Promise<string> {
    const summary = await this.getDashboardSummary(locationId);
    const anthropic = getAnthropic();

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Write a concise executive summary (3-4 paragraphs) of this business's performance over the last 30 days based on the following data:

Contacts: ${summary.contacts.total} total, ${summary.contacts.newThisPeriod} new this month
Opportunities: ${summary.opportunities.openCount} open, ${summary.opportunities.wonCount} won, ${summary.opportunities.lostCount} lost, win rate ${summary.opportunities.winRate}%, revenue R${summary.opportunities.revenue.toLocaleString()}
Conversations: ${summary.conversations.total} total, avg response ${summary.conversations.avgResponseTimeSeconds ? `${summary.conversations.avgResponseTimeSeconds}s` : 'N/A'}

Focus on trends, highlight wins, flag areas for improvement. Professional but readable tone.`,
      }],
    });

    return res.content[0].type === 'text' ? res.content[0].text : 'Report generation failed.';
  }
}
