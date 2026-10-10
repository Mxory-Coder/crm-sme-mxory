import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationAiProcessor, CONVERSATION_AI_QUEUE } from './conversation-ai.processor';
import { OpportunityAiProcessor } from './opportunity-ai.processor';
import { Conversation } from '../conversations/conversation.entity';
import { ConversationMessage } from '../conversations/conversation-message.entity';
import { ConversationAiDraft } from '../conversations/conversation-ai-draft.entity';
import { Location } from '../locations/location.entity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { OpportunityStageHistory } from '../opportunities/opportunity-stage-history.entity';
import { GatewaysModule } from '../../gateways/gateways.module';
import { OPPORTUNITY_AI_QUEUE } from '../opportunities/opportunities.service';

@Module({
  imports: [
    // Register BullMQ queue pointing at Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL')
          ? { url: config.get<string>('REDIS_URL') }
          : { host: 'localhost', port: 6379 },
      }),
    }),
    BullModule.registerQueue({
      name: CONVERSATION_AI_QUEUE,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    BullModule.registerQueue({
      name: OPPORTUNITY_AI_QUEUE,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    TypeOrmModule.forFeature([
      Conversation, ConversationMessage, ConversationAiDraft, Location,
      Opportunity, ConversationMessage, OpportunityStageHistory,
    ]),
    GatewaysModule,
  ],
  providers: [ConversationAiProcessor, OpportunityAiProcessor],
  exports: [
    // Export BullModule so other modules can inject the queue
    BullModule,
  ],
})
export class AiModule {}
