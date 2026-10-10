import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FormsService, CreateFormDto, SubmitFormDto } from './forms.service';

@Controller('v1/forms')
export class FormsController {
  constructor(private readonly svc: FormsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: { locationId: string }) {
    return this.svc.findAll(user.locationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.findById(user.locationId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: { locationId: string; id: string },
    @Body() dto: CreateFormDto,
  ) {
    return this.svc.create(user.locationId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateFormDto>,
  ) {
    return this.svc.update(user.locationId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.publish(user.locationId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { locationId: string }, @Param('id') id: string) {
    return this.svc.delete(user.locationId, id);
  }

  // ─── Public submit (no auth — called from embedded forms on client sites) ─
  @Post(':locationId/:formId/submit')
  async submit(
    @Param('locationId') locationId: string,
    @Param('formId') formId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    const dto: SubmitFormDto = {
      data: body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      pageUrl: req.headers['referer'] as string | undefined,
    };
    return this.svc.submit(locationId, formId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/submissions')
  findSubmissions(
    @CurrentUser() user: { locationId: string },
    @Param('id') id: string,
  ) {
    return this.svc.findSubmissions(user.locationId, id);
  }
}
