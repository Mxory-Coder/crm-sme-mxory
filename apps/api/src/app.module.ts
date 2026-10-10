import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { AgenciesModule } from './modules/agencies/agencies.module';
import { LocationsModule } from './modules/locations/locations.module';
import { UsersModule } from './modules/users/users.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { CalendarsModule } from './modules/calendars/calendars.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { BillingModule } from './modules/billing/billing.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AgentsModule } from './modules/agents/agents.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { VoiceModule } from './modules/voice/voice.module';
import { ContentAiModule } from './modules/content-ai/content-ai.module';
import { SocialModule } from './modules/social/social.module';
import { EmailMarketingModule } from './modules/email-marketing/email-marketing.module';
import { FunnelsModule } from './modules/funnels/funnels.module';
import { SitesModule } from './modules/sites/sites.module';
import { FormsModule } from './modules/forms/forms.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { AgencyLayerModule } from './modules/agency/agency.module';
import { AiModule } from './modules/ai/ai.module';
import { TwilioModule } from './modules/channels/twilio/twilio.module';
import { SendgridModule } from './modules/channels/sendgrid/sendgrid.module';
import { BullModule } from '@nestjs/bull';
import { ChannelRouterModule } from './modules/channels/router/channel-router.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    // ─── Config ────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // ─── Database ──────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}', __dirname + '/**/*.entities{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: false, // always run manually via CLI
        synchronize: false, // never in production
        logging: config.get('NODE_ENV') === 'development',
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // ─── Rate limiting ─────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 500 },
    ]),

    // ─── Cron jobs ─────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Queue (BullMQ via bull) ───────────────────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL')
          ? { url: config.get<string>('REDIS_URL') }
          : { host: 'localhost', port: 6379 },
      }),
    }),

    // ─── Feature modules ───────────────────────────────────────────────────
    AuthModule,
    AgenciesModule,
    LocationsModule,
    UsersModule,
    ContactsModule,
    ConversationsModule,
    PipelinesModule,
    OpportunitiesModule,
    CalendarsModule,
    DocumentsModule,
    BillingModule,
    WorkflowsModule,
    AgentsModule,
    KnowledgeBaseModule,
    VoiceModule,
    ContentAiModule,
    SocialModule,
    EmailMarketingModule,
    FunnelsModule,
    SitesModule,
    FormsModule,
    MembershipsModule,
    CommunitiesModule,
    ReputationModule,
    AgencyLayerModule,
    AiModule,
    TwilioModule,
    SendgridModule,
    ChannelRouterModule,
    GatewaysModule,
  ],
})
export class AppModule {}
