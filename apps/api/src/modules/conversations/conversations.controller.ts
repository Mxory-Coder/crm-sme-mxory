import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';

class SendMessageDto {
  body: string;
  subject?: string;
  attachments?: Array<{ url: string; mimeType: string }>;
}

class AssignDto {
  assignedTo: string;
}

class NoteDto {
  body: string;
}

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // ─── Inbox list ───────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get conversations inbox (paginated)' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'closed', 'all'] })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getInbox(
    @CurrentUser() user: AccessTokenPayload,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.conversationsService.getInbox(
      user.locationId!,
      {
        status: (status as any) ?? 'open',
        channel: channel as any,
        assignedTo,
        unreadOnly: unreadOnly === 'true',
        cursor,
        limit: limit ? parseInt(limit) : 25,
      },
      user,
    );
  }

  // ─── Get single conversation ──────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.conversationsService.findConvOrFail(id, user.locationId!);
  }

  // ─── Message thread (cursor-paginated) ───────────────────────────────────
  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation thread' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getThread(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.conversationsService.getThread(id, cursor, limit ? parseInt(limit) : 50);
  }

  // ─── Send outbound message ────────────────────────────────────────────────
  @Post(':id/messages')
  @ApiOperation({ summary: 'Send an outbound message' })
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.conversationsService.saveOutbound(
      id,
      user.locationId!,
      dto.body,
      user.sub,
      '',   // externalId — filled in after channel send (handled by channel router in full flow)
    );
  }

  // ─── Mark as read ─────────────────────────────────────────────────────────
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark conversation as read (reset unread count)' })
  markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.conversationsService.markRead(id, user.locationId!);
  }

  // ─── Assign conversation ──────────────────────────────────────────────────
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign conversation to a user' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.conversationsService.assign(id, user.locationId!, dto.assignedTo);
  }

  // ─── Add internal note ────────────────────────────────────────────────────
  @Post(':id/notes')
  @ApiOperation({ summary: 'Add an internal note (not sent to contact)' })
  addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: NoteDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.conversationsService.addInternalNote(id, user.locationId!, dto.body, user.sub);
  }
}
