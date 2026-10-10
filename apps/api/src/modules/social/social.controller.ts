import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SocialService, CreateSocialPostDto, AiCaptionDto } from './social.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('posts')
  findAll(
    @CurrentUser() user: { locationId: string },
    @Query('status') status?: string,
  ) {
    return this.socialService.findAll(user.locationId, status);
  }

  @Get('posts/calendar')
  getCalendar(
    @CurrentUser() user: { locationId: string },
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.socialService.getCalendar(user.locationId, new Date(from), new Date(to));
  }

  @Get('posts/:id')
  findById(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.socialService.findById(user.locationId, id);
  }

  @Post('posts')
  create(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: CreateSocialPostDto,
  ) {
    return this.socialService.create(user.locationId, dto, user.id);
  }

  @Patch('posts/:id')
  update(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateSocialPostDto>,
  ) {
    return this.socialService.update(user.locationId, id, dto);
  }

  @Post('posts/:id/publish')
  publish(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.socialService.publish(user.locationId, id);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.socialService.delete(user.locationId, id);
  }

  @Post('ai/caption')
  generateCaption(@Body() dto: AiCaptionDto) {
    return this.socialService.generateCaption(dto);
  }

  @Post('ai/blog-to-social')
  blogToSocial(@Body() body: { title: string; excerpt: string; platforms: string[] }) {
    return this.socialService.blogToSocial(body.title, body.excerpt, body.platforms);
  }
}
