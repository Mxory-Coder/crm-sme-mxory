import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwilioService } from './twilio.service';
import { TwilioWebhookController } from './twilio-webhook.controller';
import { Location } from '../../locations/location.entity';
import { ContactsModule } from '../../contacts/contacts.module';
import { ConversationsModule } from '../../conversations/conversations.module';
import { GatewaysModule } from '../../../gateways/gateways.module';
import { ChannelRouterModule } from '../router/channel-router.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    ContactsModule,
    ConversationsModule,
    GatewaysModule,
    ChannelRouterModule,
  ],
  controllers: [TwilioWebhookController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
