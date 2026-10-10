import { Module, forwardRef } from '@nestjs/common';
import { ChannelRouterService } from './channel-router.service';
import { TwilioModule } from '../twilio/twilio.module';
import { SendgridModule } from '../sendgrid/sendgrid.module';

/**
 * ChannelRouterModule wires the dispatch service to both channel adapters.
 * Uses forwardRef to break the TwilioModule ↔ ChannelRouterModule circular
 * dependency that arises because TwilioModule imports ChannelRouterModule for
 * the missed-call handler, while ChannelRouterModule imports TwilioModule for
 * the SMS send path.
 */
@Module({
  imports: [
    forwardRef(() => TwilioModule),
    SendgridModule,
  ],
  providers: [ChannelRouterService],
  exports: [ChannelRouterService],
})
export class ChannelRouterModule {}
