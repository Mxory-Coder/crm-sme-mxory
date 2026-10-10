import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';

class CreateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  assignedTo?: string;
  source?: string;
}

class UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  assignedTo?: string;
  doNotDisturb?: boolean;
}

class SetCustomFieldDto {
  key: string;
  value: unknown;
}

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // ─── List contacts ────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'List contacts (cursor-paginated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('search') search?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('tag') tag?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.findAll(
      user.locationId!,
      { search, assignedTo, tag, cursor, limit: limit ? parseInt(limit) : 25 },
      user,
    );
  }

  // ─── Get contact by ID ────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.findByIdOrFail(id, user.locationId!);
  }

  // ─── Create contact ───────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Create or merge a contact' })
  create(
    @Body() dto: CreateContactDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.findOrCreateByIdentifier({
      ...dto,
      locationId: user.locationId!,
    });
  }

  // ─── Update contact ───────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.update(id, user.locationId!, dto);
  }

  // ─── Delete (soft) ────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a contact' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.softDelete(id, user.locationId!);
  }

  // ─── Add tag ──────────────────────────────────────────────────────────────
  @Post(':id/tags/:tag')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a tag to a contact' })
  addTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tag') tag: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.addTag(id, user.locationId!, tag);
  }

  // ─── Remove tag ───────────────────────────────────────────────────────────
  @Delete(':id/tags/:tag')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a tag from a contact' })
  removeTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tag') tag: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.removeTag(id, user.locationId!, tag);
  }

  // ─── Set custom field ─────────────────────────────────────────────────────
  @Patch(':id/custom-fields')
  @ApiOperation({ summary: 'Set a custom field value on a contact' })
  setCustomField(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetCustomFieldDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.contactsService.setCustomField(id, dto.key, dto.value);
  }
}
