import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentAiService, GenerateTextDto, RewriteDto } from './content-ai.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/content-ai')
export class ContentAiController {
  constructor(private readonly contentAiService: ContentAiService) {}

  @Post('generate')
  generate(@Body() body: GenerateTextDto) {
    return this.contentAiService.generateText(body);
  }

  @Post('rewrite')
  rewrite(@Body() body: RewriteDto) {
    return this.contentAiService.rewrite(body);
  }

  @Post('email-sequence')
  emailSequence(
    @Body() body: { topic: string; steps: number; businessName: string; tone?: string },
  ) {
    return this.contentAiService.generateEmailSequence(
      body.topic,
      body.steps,
      body.businessName,
      body.tone,
    );
  }

  @Post('social-variants')
  socialVariants(@Body() body: { caption: string; platforms: string[] }) {
    return this.contentAiService.generateSocialVariants(body.caption, body.platforms);
  }

  @Post('generate-image')
  generateImage(@Body() body: { prompt: string }) {
    return this.contentAiService.generateImage(body.prompt);
  }
}
