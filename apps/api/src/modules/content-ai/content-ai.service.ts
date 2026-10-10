import { Injectable, Logger } from '@nestjs/common';
import { getAnthropic, getOpenAI, CLAUDE_MODEL } from '@sme/ai';

export interface GenerateTextDto {
  type: 'sms' | 'email_subject' | 'email_body' | 'social_caption' | 'proposal' | 'review_request' | 'ad_copy';
  topic: string;
  tone?: 'professional' | 'friendly' | 'casual' | 'urgent' | 'empathetic';
  businessName?: string;
  contactName?: string;
  platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  maxLength?: number;
  additionalContext?: string;
}

export interface GenerateTextResult {
  content: string;
  model: string;
  alternatives?: string[];
}

export interface RewriteDto {
  original: string;
  instruction: string;
  tone?: string;
}

@Injectable()
export class ContentAiService {
  private readonly logger = new Logger(ContentAiService.name);

  async generateText(dto: GenerateTextDto): Promise<GenerateTextResult> {
    const prompt = this.buildPrompt(dto);

    // Use GPT-4o for social captions and ad copy, Claude for everything else
    const useGpt = dto.type === 'social_caption' || dto.type === 'ad_copy';

    if (useGpt) {
      return this.generateWithGpt(prompt, dto.type);
    }
    return this.generateWithClaude(prompt, dto.type);
  }

  async rewrite(dto: RewriteDto): Promise<GenerateTextResult> {
    const anthropic = getAnthropic();
    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Rewrite the following text. Instruction: "${dto.instruction}"${dto.tone ? `. Tone: ${dto.tone}` : ''}.

Original:
${dto.original}

Return only the rewritten text, no preamble.`,
      }],
    });

    const content = res.content[0].type === 'text' ? res.content[0].text : '';
    return { content: content.trim(), model: CLAUDE_MODEL };
  }

  async generateEmailSequence(
    topic: string,
    steps: number,
    businessName: string,
    tone = 'professional',
  ): Promise<Array<{ subject: string; body: string; delay: string }>> {
    const anthropic = getAnthropic();
    const TOOL = {
      name: 'create_email_sequence',
      description: 'Create a multi-step email nurture sequence',
      input_schema: {
        type: 'object' as const,
        properties: {
          emails: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                subject: { type: 'string' },
                body: { type: 'string', description: 'Email body in plain text, no HTML' },
                delay: { type: 'string', description: 'e.g. "Immediately", "Day 3", "Week 1"' },
              },
              required: ['subject', 'body', 'delay'],
            },
          },
        },
        required: ['emails'],
      },
    };

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'create_email_sequence' },
      messages: [{
        role: 'user',
        content: `Create a ${steps}-email nurture sequence for ${businessName} about: "${topic}". Tone: ${tone}. Use merge tags like {{contact.first_name}}.`,
      }],
    });

    const toolBlock = res.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') return [];
    return (toolBlock.input as any).emails ?? [];
  }

  async generateSocialVariants(
    caption: string,
    platforms: string[],
  ): Promise<Record<string, string>> {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [{
        role: 'system',
        content: 'You are a social media content specialist. Adapt captions for each platform\'s style and character limits. Return only JSON.',
      }, {
        role: 'user',
        content: `Adapt this caption for: ${platforms.join(', ')}.
Original: "${caption}"

Return JSON: { "facebook": "...", "instagram": "...", "twitter": "...", "linkedin": "..." }
Only include requested platforms. Instagram: add 5 hashtags. Twitter: max 280 chars. LinkedIn: professional tone.`,
      }],
      response_format: { type: 'json_object' },
    });

    const text = res.choices[0].message.content ?? '{}';
    try {
      return JSON.parse(text) as Record<string, string>;
    } catch {
      return {};
    }
  }

  async generateImage(prompt: string): Promise<{ url: string }> {
    const openai = getOpenAI();
    const res = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    return { url: res.data?.[0]?.url ?? '' };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  private buildPrompt(dto: GenerateTextDto): string {
    const toneStr = dto.tone ? ` Tone: ${dto.tone}.` : '';
    const bizStr = dto.businessName ? ` Business: ${dto.businessName}.` : '';
    const ctxStr = dto.additionalContext ? ` Context: ${dto.additionalContext}.` : '';
    const maxStr = dto.maxLength ? ` Max ${dto.maxLength} characters.` : '';

    switch (dto.type) {
      case 'sms':
        return `Write a concise SMS message about: "${dto.topic}".${toneStr}${bizStr}${ctxStr}${maxStr} Max 160 characters. Use {{contact.first_name}} for personalisation. Return only the message.`;

      case 'email_subject':
        return `Write 3 email subject line variants about: "${dto.topic}".${toneStr}${bizStr}${ctxStr} Numbered list. Max 60 chars each.`;

      case 'email_body':
        return `Write a professional email body about: "${dto.topic}".${toneStr}${bizStr}${ctxStr} Use {{contact.first_name}} and {{location.name}}. Return only the body, no subject line.`;

      case 'social_caption':
        return `Write an engaging ${dto.platform ?? 'social media'} caption about: "${dto.topic}".${toneStr}${bizStr}${ctxStr}${maxStr} Return only the caption.`;

      case 'proposal':
        return `Write a professional business proposal about: "${dto.topic}".${toneStr}${bizStr}${ctxStr} Include: executive summary, scope, deliverables, pricing note. Use {{contact.full_name}}.`;

      case 'review_request':
        return `Write a personalised review request SMS/message for ${dto.businessName ?? 'the business'} about: "${dto.topic}".${toneStr}${ctxStr} Use {{contact.first_name}}. Keep it short and genuine. Max 120 characters.`;

      case 'ad_copy':
        return `Write high-converting ad copy about: "${dto.topic}".${toneStr}${bizStr}${ctxStr}${maxStr} Include: headline, body, CTA. Return each on a new line labelled.`;

      default:
        return `Write content about: "${dto.topic}".${toneStr}${bizStr}${ctxStr}${maxStr}`;
    }
  }

  private async generateWithClaude(prompt: string, type: string): Promise<GenerateTextResult> {
    const anthropic = getAnthropic();
    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = res.content[0].type === 'text' ? res.content[0].text.trim() : '';
    return { content, model: CLAUDE_MODEL };
  }

  private async generateWithGpt(prompt: string, type: string): Promise<GenerateTextResult> {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: 'You are an expert copywriter and social media specialist.' },
        { role: 'user', content: prompt },
      ],
    });
    const content = res.choices[0].message.content?.trim() ?? '';
    return { content, model: 'gpt-4o' };
  }
}
