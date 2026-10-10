import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ─── Singleton clients (instantiated with env vars at runtime) ────────────────

let _anthropic: Anthropic | null = null;
let _openai: OpenAI | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

export function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Model constants ──────────────────────────────────────────────────────────
export const CLAUDE_MODEL = 'claude-opus-4-5';
export const GPT_MODEL = 'gpt-4o';
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

// ─── Re-export SDK types for convenience ─────────────────────────────────────
export { Anthropic, OpenAI };
