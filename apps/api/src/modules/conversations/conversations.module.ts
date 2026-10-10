import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Conversation } from './conversation.entity';
import { ConversationMessage } from './conversation-message.entity';
import { ConversationAiDraft } from './conversation-ai-draft.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { CONVERSATION_AI_QUEUE } from '../ai/conversation-ai.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationMessage, ConversationAiDraft]),
    // Register the queue so @InjectQueue resolves — actual Redis config is in AiModule/BullModule.forRoot
    BullModule.registerQueue({ name: CONVERSATION_AI_QUEUE }),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService, TypeOrmModule],
})
export class ConversationsModule {}
