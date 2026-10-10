import { Controller, Post, Res, Body, Query, Get } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Serves TwiML for Twilio Voice calls.
 * Connects inbound calls to the VoiceAIGateway WebSocket.
 */
@Controller('v1/voice')
export class VoiceController {
  constructor(private readonly config: ConfigService) {}

  /**
   * POST /v1/voice/inbound
   * Twilio calls this when a call arrives.
   * Returns TwiML that connects the call to the AI WebSocket stream.
   */
  @Post('inbound')
  inbound(
    @Body() body: { CallSid: string; From: string; To: string; LocationId?: string },
    @Res() res: Response,
  ) {
    const apiBase = this.config.get<string>('API_BASE_URL') ?? 'https://api.example.com';
    const locationId = body.LocationId ?? '';

    const wsUrl = `${apiBase.replace('https://', 'wss://').replace('http://', 'ws://')}/voice-ai?callSid=${body.CallSid}&from=${encodeURIComponent(body.From)}&locationId=${locationId}`;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="callSid" value="${body.CallSid}" />
      <Parameter name="locationId" value="${locationId}" />
    </Stream>
  </Connect>
</Response>`;

    res.set('Content-Type', 'text/xml').send(twiml);
  }

  /**
   * POST /v1/voice/status
   * Twilio status callback — detects missed calls.
   */
  @Post('status')
  status(@Body() body: Record<string, string>) {
    // Missed call detection handled in TwilioWebhookController
    // This endpoint just acknowledges receipt
    return { received: true };
  }

  /**
   * GET /v1/voice/transfer-twiml
   * Served when AI triggers a human transfer mid-call.
   */
  @Get('transfer-twiml')
  transferTwiml(@Query('reason') reason: string, @Res() res: Response) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please hold while I transfer you to one of our team members.</Say>
  <Dial>
    <Number statusCallbackEvent="initiated answered completed" statusCallback="/v1/voice/status">+27000000000</Number>
  </Dial>
</Response>`;
    res.set('Content-Type', 'text/xml').send(twiml);
  }
}
