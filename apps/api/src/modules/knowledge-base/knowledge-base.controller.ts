import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { KnowledgeBaseService, AddChunkDto } from './knowledge-base.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Get()
  list(
    @Query('agentId') agentId: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('offset') offset: string | undefined,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.kbService.list(user.locationId!, agentId, limit ? +limit : 50, offset ? +offset : 0);
  }

  @Post()
  addChunk(@Body() body: AddChunkDto, @CurrentUser() user: AccessTokenPayload) {
    return this.kbService.addChunk(user.locationId!, body);
  }

  @Post('qa-pairs')
  addQAPairs(
    @Body() body: { agentId: string; pairs: { q: string; a: string; category?: string; priority?: number }[] },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.kbService.addQAPairs(user.locationId!, body.agentId, body.pairs);
  }

  @Post('search')
  search(
    @Body() body: { query: string; agentId?: string; topK?: number },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.kbService.search(user.locationId!, body.query, body.topK ?? 5, body.agentId);
  }

  @Delete(':id')
  deleteChunk(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.kbService.deleteChunk(id, user.locationId!);
  }
}
