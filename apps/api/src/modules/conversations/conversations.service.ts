import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Conversation } from './conversation.entity';
import { ConversationMessage } from './conversation-message.entity';
import { ConversationAiDraft } from './conversation-ai-draft.entity';
import { AccessTokenPayload, ChannelType } from '@sme/shared';
import { CONVERSATION_AI_QUEUE } from '../ai/conversation-ai.processor';

export interface NormalizedInbound {
  externalId: string;
  channel: ChannelType;
  body: string;
  attachments?: Array<{ url: string; mimeType: string; name?: string }>;
  senderId: string;   // phone / email / PSID / IGSID
  locationId: string;
  contactId: string;
  sentAt: Date;
  subject?: string;   // email only
}

export interface SendMessageDto {
  body: string;
  attachments?: Array<{ url: string; mimeType: string }>;
  messageTag?: string; // Facebook message tag (outside 24h window)
}

export interface InboxFilters {
  status?: 'open' | 'closed' | 'all';
  assignedTo?: string;
  channel?: ChannelType;
  unreadOnly?: boolean;
  search?: string;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly msgRepo: Repository<ConversationMessage>,
    @Optional()
    @InjectQueue(CONVERSATION_AI_QUEUE)
    private readonly aiQueue: Queue | null,
  ) {}

  // ─── Find or create the conversation thread ───────────────────────────────
  async findOrCreate(
    locationId: string,
    contactId: string,
    channel: ChannelType,
  ): Promise<Conversation> {
    let conv = await this.convRepo.findOne({
      where: { locationId, contactId, type: channel, deletedAt: IsNull() },
    });
    if (!conv) {
      conv = this.convRepo.create({
        locationId,
        contactId,
        type: channel,
        status: 'open',
        unreadCount: 0,
      });
      await this.convRepo.save(conv);
    }
    return conv;
  }

  // ─── Save inbound message + update conversation metadata ─────────────────
  async saveInbound(dto: NormalizedInbound): Promise<ConversationMessage> {
    const conv = await this.findOrCreate(dto.locationId, dto.contactId, dto.channel);

    const msg = this.msgRepo.create({
      conversationId: conv.id,
      contactId: dto.contactId,
      locationId: dto.locationId,
      direction: 'inbound',
      channel: dto.channel,
      body: dto.body,
      attachments: dto.attachments ?? [],
      externalId: dto.externalId,
      status: 'DELIVERED',
      sentAt: dto.sentAt,
    });
    await this.msgRepo.save(msg);

    // Denormalize last message onto conversation + increment unread
    await this.convRepo.update(conv.id, {
      lastMessageAt: dto.sentAt,
      lastMessageBody: dto.body?.substring(0, 200),
      lastMessageType: dto.channel,
      unreadCount: () => 'unread_count + 1',
      status: 'open', // re-open if it was closed
    });

    // Fire AI draft generation (non-blocking — failures are silently swallowed in processor)
    if (this.aiQueue) {
      await this.aiQueue.add(
        'generate-draft',
        { conversationId: conv.id, messageId: msg.id, locationId: dto.locationId },
        { delay: 1500 }, // small delay so the message is committed before Claude reads it
      );
    }

    return msg;
  }

  // ─── Get inbox list ───────────────────────────────────────────────────────
  async getInbox(
    locationId: string,
    filters: InboxFilters,
    requestingUser: AccessTokenPayload,
  ) {
    const limit = Math.min(filters.limit ?? 25, 100);
    const qb = this.convRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.contact', 'contact')
      .leftJoinAndSelect('conv.assignedUser', 'assignedUser')
      .where('conv.location_id = :locationId', { locationId })
      .andWhere('conv.deleted_at IS NULL')
      .orderBy('conv.last_message_at', 'DESC', 'NULLS LAST')
      .take(limit + 1);

    if (!filters.status || filters.status === 'open') {
      qb.andWhere("conv.status = 'open'");
    } else if (filters.status === 'closed') {
      qb.andWhere("conv.status = 'closed'");
    }

    if (filters.channel) {
      qb.andWhere('conv.type = :channel', { channel: filters.channel });
    }

    if (filters.assignedTo === 'me') {
      qb.andWhere('conv.assigned_to = :me', { me: requestingUser.sub });
    } else if (filters.assignedTo === 'unassigned') {
      qb.andWhere('conv.assigned_to IS NULL');
    } else if (filters.assignedTo) {
      qb.andWhere('conv.assigned_to = :assignedTo', { assignedTo: filters.assignedTo });
    }

    if (filters.unreadOnly) {
      qb.andWhere('conv.unread_count > 0');
    }

    if (filters.cursor) {
      qb.andWhere('conv.last_message_at < :cursor', { cursor: new Date(filters.cursor) });
    }

    // Only Assigned Data
    if (requestingUser.onlyAssignedData) {
      qb.andWhere(
        `(conv.assigned_to = :oaUserId OR EXISTS (
          SELECT 1 FROM entity_followers ef
          WHERE ef.entity_type = 'contact'
            AND ef.entity_id = conv.contact_id
            AND ef.user_id = :oaUserId
        ))`,
        { oaUserId: requestingUser.sub },
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return {
      data,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1].lastMessageAt?.toISOString() : null,
    };
  }

  // ─── Get message thread (cursor paginated, oldest first) ─────────────────
  async getThread(conversationId: string, cursor?: string, limit = 50) {
    const qb = this.msgRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.user', 'user')
      .where('msg.conversation_id = :conversationId', { conversationId })
      .orderBy('msg.created_at', 'DESC')
      .take(limit + 1);

    if (cursor) {
      qb.andWhere('msg.created_at < :cursor', { cursor: new Date(cursor) });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = (hasMore ? rows.slice(0, limit) : rows).reverse();
    return {
      data,
      hasMore,
      nextCursor: hasMore ? rows[limit - 1].createdAt.toISOString() : null,
    };
  }

  // ─── Mark conversation as read ────────────────────────────────────────────
  async markRead(conversationId: string, locationId: string): Promise<void> {
    await this.convRepo.update({ id: conversationId, locationId }, { unreadCount: 0 });
    await this.msgRepo.query(
      `UPDATE conversation_messages
       SET read_at = NOW()
       WHERE conversation_id = $1 AND direction = 'inbound' AND read_at IS NULL`,
      [conversationId],
    );
  }

  // ─── Assign conversation to a user ───────────────────────────────────────
  async assign(conversationId: string, locationId: string, assignedTo: string | null) {
    const conv = await this.findConvOrFail(conversationId, locationId);
    conv.assignedTo = assignedTo ?? null as any;
    return this.convRepo.save(conv);
  }

  // ─── Add internal note (never sent to contact) ────────────────────────────
  async addInternalNote(
    conversationId: string,
    locationId: string,
    body: string,
    userId: string,
  ): Promise<ConversationMessage> {
    const conv = await this.findConvOrFail(conversationId, locationId);
    const msg = this.msgRepo.create({
      conversationId: conv.id,
      locationId,
      userId,
      direction: 'internal',
      channel: conv.type,
      body,
      messageType: 'INTERNAL_COMMENT',
      status: 'SENT',
      sentAt: new Date(),
    });
    return this.msgRepo.save(msg);
  }

  // ─── Save an outbound message record ─────────────────────────────────────
  async saveOutbound(
    conversationId: string,
    locationId: string,
    body: string,
    userId: string,
    externalId: string,
    aiGenerated = false,
  ): Promise<ConversationMessage> {
    const conv = await this.findConvOrFail(conversationId, locationId);

    const msg = this.msgRepo.create({
      conversationId,
      locationId,
      userId,
      direction: 'outbound',
      channel: conv.type,
      body,
      externalId,
      status: 'SENT',
      sentAt: new Date(),
      aiGenerated,
    });
    await this.msgRepo.save(msg);

    await this.convRepo.update(conversationId, {
      lastMessageAt: new Date(),
      lastMessageBody: body.substring(0, 200),
      lastMessageType: conv.type,
    });

    return msg;
  }

  async findConvOrFail(conversationId: string, locationId: string): Promise<Conversation> {
    const conv = await this.convRepo.findOne({
      where: { id: conversationId, locationId, deletedAt: IsNull() },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.convRepo.findOne({ where: { id } });
  }
}
