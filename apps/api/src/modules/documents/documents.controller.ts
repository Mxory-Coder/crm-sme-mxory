import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { DocumentsService, CreateDocumentDto, SignDocumentDto } from './documents.service';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(
    @Query('contactId') contactId: string | undefined,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.documentsService.findAll(user.locationId!, contactId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.documentsService.findOne(id, user.locationId!);
  }

  @Post()
  create(@Body() body: CreateDocumentDto, @CurrentUser() user: AccessTokenPayload) {
    return this.documentsService.create(user.locationId!, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreateDocumentDto>,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.documentsService.update(id, user.locationId!, body);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.documentsService.send(id, user.locationId!);
  }

  @Post(':id/view')
  trackView(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.documentsService.trackView(id, user.locationId!);
  }

  @Post(':id/sign')
  sign(
    @Param('id') id: string,
    @Body() body: Omit<SignDocumentDto, 'ipAddress' | 'userAgent'>,
    @CurrentUser() user: AccessTokenPayload,
    @Req() req: Request,
  ) {
    const dto: SignDocumentDto = {
      ...body,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '0.0.0.0',
      userAgent: req.headers['user-agent'] ?? '',
    };
    return this.documentsService.sign(id, user.locationId!, dto);
  }

  @Get(':id/signatures')
  signatures(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.documentsService.getSignatures(id, user.locationId!);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.documentsService.remove(id, user.locationId!);
  }
}
