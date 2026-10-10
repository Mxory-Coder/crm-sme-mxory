import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '@sme/shared';
import { ConversationMessage } from '../modules/conversations/conversation-message.entity';
import { Conversation } from '../modules/conversations/conversation.entity';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
})
export class InboxGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(InboxGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Auth on connect ──────────────────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers.authorization?.replace('Bearer ', '') as string);

      if (!token) return client.disconnect();

      const payload = this.jwtService.verify<AccessTokenPayload>(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });

      // Join location-wide room
      if (payload.locationId) {
        await client.join(`location:${payload.locationId}:conversations`);
      }

      // Store user info on socket
      (client.data as any).user = payload;
      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ─── Client joins a specific conversation thread ──────────────────────────
  @SubscribeMessage('join:conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await client.join(`conversation:${data.conversationId}`);
    return { joined: data.conversationId };
  }

  @SubscribeMessage('leave:conversation')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await client.leave(`conversation:${data.conversationId}`);
  }

  // ─── Emit helpers called by services ─────────────────────────────────────

  /** Broadcast a new inbound/outbound message to everyone in the thread */
  emitNewMessage(conversationId: string, message: Partial<ConversationMessage>) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('message:new', { conversationId, message });
  }

  /** Broadcast conversation metadata update to everyone in the location inbox */
  emitConversationUpdated(locationId: string, conv: Partial<Conversation>) {
    this.server
      .to(`location:${locationId}:conversations`)
      .emit('conversation:updated', conv);
  }

  /** Push AI draft to the open thread */
  emitAiDraft(
    conversationId: string,
    draft: { id: string; body: string; confidence?: number },
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('ai:draft', { conversationId, draft });
  }
}
