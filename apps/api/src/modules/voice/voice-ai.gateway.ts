import {
  WebSocketGateway, WebSocketServer, OnGatewayInit,
  OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import WebSocket = require('ws');
import { VoiceSession } from './voice-session.entity';
import { ContactsService } from '../contacts/contacts.service';

interface SessionState {
  callSid: string;
  locationId: string;
  fromNumber: string;
  streamSid: string | null;
  openAiWs: WebSocket | null;
  transcript: Array<{ role: string; text: string }>;
  sessionId: string | null;
}

const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

/**
 * VoiceAIGateway — bridges Twilio Media Streams WebSocket to OpenAI Realtime API.
 *
 * Twilio calls this via:
 *   <Connect><Stream url="wss://api.smeconnect.co.za/voice-ai" /></Connect>
 *
 * Audio path:
 *   Twilio (mulaw 8kHz) → gateway → PCM16 24kHz → OpenAI Realtime
 *   OpenAI PCM16 24kHz → mulaw 8kHz → gateway → Twilio
 */
@Injectable()
@WebSocketGateway({ namespace: '/voice-ai', cors: { origin: '*' } })
export class VoiceAIGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(VoiceAIGateway.name);
  private readonly sessions = new Map<string, SessionState>(); // socketId → state

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(VoiceSession) private readonly sessionRepo: Repository<VoiceSession>,
    private readonly contactsService: ContactsService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('VoiceAIGateway initialised on /voice-ai');
  }

  handleConnection(client: Socket) {
    const callSid = (client.handshake.query['callSid'] as string) ?? 'unknown';
    const locationId = (client.handshake.query['locationId'] as string) ?? '';
    const fromNumber = (client.handshake.query['from'] as string) ?? '';

    this.logger.log(`Voice stream connected: ${callSid}`);
    this.sessions.set(client.id, {
      callSid,
      locationId,
      fromNumber,
      streamSid: null,
      openAiWs: null,
      transcript: [],
      sessionId: null,
    });

    this.initOpenAISession(client);
  }

  handleDisconnect(client: Socket) {
    const state = this.sessions.get(client.id);
    if (state) {
      state.openAiWs?.close();
      this.finaliseSession(state);
      this.sessions.delete(client.id);
      this.logger.log(`Voice stream disconnected: ${state.callSid}`);
    }
  }

  // ─── Inbound messages from Twilio Media Streams ────────────────────────────
  @SubscribeMessage('message')
  handleTwilioMessage(client: Socket, raw: string) {
    const state = this.sessions.get(client.id);
    if (!state) return;

    let msg: Record<string, unknown>;
    try { msg = JSON.parse(raw); } catch { return; }

    const event = msg['event'] as string;

    switch (event) {
      case 'start': {
        const start = msg['start'] as any;
        state.streamSid = start.streamSid;
        this.logger.log(`Stream started: ${state.streamSid}`);
        break;
      }
      case 'media': {
        if (!state.openAiWs || state.openAiWs.readyState !== WebSocket.OPEN) return;
        const media = (msg['media'] as any);
        // Forward mulaw audio to OpenAI (it handles 8kHz mulaw natively with PCM conversion config)
        state.openAiWs.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: media.payload, // base64 mulaw
        }));
        break;
      }
      case 'stop': {
        state.openAiWs?.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        break;
      }
    }
  }

  // ─── Initialise OpenAI Realtime session ───────────────────────────────────
  private initOpenAISession(client: Socket) {
    const state = this.sessions.get(client.id);
    if (!state) return;

    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set — voice AI disabled');
      return;
    }

    const ws = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    state.openAiWs = ws;

    ws.on('open', () => {
      // Configure session: mulaw in/out, VAD, tools
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          voice: 'alloy',
          input_audio_format: 'g711_ulaw', // Twilio sends mulaw — OpenAI accepts as g711_ulaw
          output_audio_format: 'g711_ulaw',
          input_audio_transcription: { model: 'whisper-1' },
          turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 700, create_response: true },
          tools: [
            {
              type: 'function',
              name: 'transfer_to_human',
              description: 'Transfer this call to a human agent',
              parameters: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] },
            },
            {
              type: 'function',
              name: 'end_call',
              description: 'End the call politely',
              parameters: { type: 'object', properties: { summary: { type: 'string' } } },
            },
          ],
          tool_choice: 'auto',
          instructions: `You are a helpful voice assistant for a business.
Be concise — this is a phone call.
Keep responses under 3 sentences.
If you can't help, transfer to a human.`,
        },
      }));
    });

    ws.on('message', (rawData: Buffer) => {
      let event: Record<string, unknown>;
      try { event = JSON.parse(rawData.toString()); } catch { return; }

      const type = event['type'] as string;

      // Stream audio back to Twilio
      if (type === 'response.audio.delta' && state.streamSid) {
        const delta = event['delta'] as string;
        client.emit('message', JSON.stringify({
          event: 'media',
          streamSid: state.streamSid,
          media: { payload: delta },
        }));
      }

      // Capture transcript
      if (type === 'conversation.item.input_audio_transcription.completed') {
        state.transcript.push({ role: 'user', text: (event['transcript'] as string) ?? '' });
      }
      if (type === 'response.audio_transcript.done') {
        state.transcript.push({ role: 'assistant', text: (event['transcript'] as string) ?? '' });
      }

      // Handle tool calls
      if (type === 'response.function_call_arguments.done') {
        const name = event['name'] as string;
        if (name === 'transfer_to_human') {
          this.logger.log(`Call transfer requested: ${state.callSid}`);
          // In production: use Twilio REST API to update the call with transfer TwiML
        }
        if (name === 'end_call') {
          client.emit('message', JSON.stringify({ event: 'stop', streamSid: state.streamSid }));
        }
      }
    });

    ws.on('error', (err: Error) => {
      this.logger.error(`OpenAI WS error: ${err.message}`);
    });

    ws.on('close', () => {
      this.logger.log(`OpenAI WS closed for ${state.callSid}`);
    });
  }

  // ─── Persist session after call ends ──────────────────────────────────────
  private async finaliseSession(state: SessionState): Promise<void> {
    try {
      // Upsert contact by phone
      if (state.fromNumber && state.locationId) {
        await this.contactsService.findOrCreateByIdentifier({
          locationId: state.locationId,
          phone: state.fromNumber,
        });
      }

      await this.sessionRepo.save(
        this.sessionRepo.create({
          locationId: state.locationId,
          callSid: state.callSid,
          fromNumber: state.fromNumber,
          toNumber: '',
          direction: 'inbound',
          status: 'completed',
          transcript: state.transcript,
          endedAt: new Date(),
        }),
      );
    } catch (err) {
      this.logger.error(`Failed to save voice session: ${(err as Error).message}`);
    }
  }
}
