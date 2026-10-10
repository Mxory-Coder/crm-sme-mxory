import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendgridService } from './sendgrid.service';
import { SendgridWebhookController } from './sendgrid-webhook.controller';
import { Location } from '../../locations/location.entity';
import { ContactsModule } from '../../contacts/contacts.module';
import { ConversationsModule } from '../../conversations/conversations.module';
import { GatewaysModule } from '../../../gateways/gateways.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    ContactsModule,
    ConversationsModule,
    GatewaysModule,
  ],
  controllers: [SendgridWebhookController],
  providers: [SendgridService],
  exports: [SendgridService],
})
export class SendgridModule {}
