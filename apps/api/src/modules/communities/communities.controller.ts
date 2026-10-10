import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CommunitiesService } from './communities.service';
import { Community } from './community.entities';

@UseGuards(JwtAuthGuard)
@Controller('v1/communities')
export class CommunitiesController {
  constructor(private readonly svc: CommunitiesService) {}

  @Get()
  findAll(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAll(user.locationId);
  }

  @Get(':id')
  findById(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.findById(user.locationId, id);
  }

  @Post()
  create(
    @CurrentUser() user: { locationId: string },
    @Body() dto: Partial<Community>,
  ) {
    return this.svc.create(user.locationId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<Community>,
  ) {
    return this.svc.update(user.locationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.delete(user.locationId, id);
  }

  // ─── Posts ────────────────────────────────────────────────────────────────

  @Get(':id/posts')
  findPosts(
    @CurrentUser() user: { locationId: string },
    @Param('id') communityId: string,
    @Query('page') page = '1',
  ) {
    return this.svc.findPosts(user.locationId, communityId, parseInt(page, 10));
  }

  @Post(':id/posts')
  createPost(
    @CurrentUser() user: { locationId: string; id: string },
    @Param('id') communityId: string,
    @Body() body: { text: string; mediaUrls?: string[] },
  ) {
    return this.svc.createPost(user.locationId, communityId, body.text, body.mediaUrls ?? [], user.id, false);
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(
    @CurrentUser() user: { locationId: string },
    @Param('postId') postId: string,
  ) {
    return this.svc.deletePost(user.locationId, postId);
  }

  @Post(':id/posts/:postId/pin')
  pinPost(
    @CurrentUser() user: { locationId: string },
    @Param('postId') postId: string,
    @Body() body: { pinned: boolean },
  ) {
    return this.svc.pinPost(user.locationId, postId, body.pinned);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Get(':id/posts/:postId/comments')
  findComments(
    @CurrentUser() user: { locationId: string },
    @Param('postId') postId: string,
  ) {
    return this.svc.findComments(user.locationId, postId);
  }

  @Post(':id/posts/:postId/comments')
  createComment(
    @CurrentUser() user: { locationId: string; id: string },
    @Param('postId') postId: string,
    @Body() body: { text: string },
  ) {
    return this.svc.createComment(user.locationId, postId, body.text, user.id, false);
  }

  @Delete(':id/posts/:postId/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(
    @CurrentUser() user: { locationId: string },
    @Param('commentId') commentId: string,
  ) {
    return this.svc.deleteComment(user.locationId, commentId);
  }
}
