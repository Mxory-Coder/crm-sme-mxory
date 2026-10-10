import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '@sme/shared';
import { CalendarsService, CreateCalendarDto, BookAppointmentDto } from './calendars.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Get()
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.calendarsService.findAll(user.locationId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.calendarsService.findOne(id, user.locationId!);
  }

  @Post()
  create(@Body() body: CreateCalendarDto, @CurrentUser() user: AccessTokenPayload) {
    return this.calendarsService.create(user.locationId!, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreateCalendarDto>,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.calendarsService.update(id, user.locationId!, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.calendarsService.remove(id, user.locationId!);
  }

  // ─── Appointments ──────────────────────────────────────────────────────────
  @Get('appointments/upcoming')
  upcoming(
    @Query('contactId') contactId: string | undefined,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.calendarsService.getUpcoming(user.locationId!, contactId);
  }

  @Get(':id/appointments')
  getAppointments(
    @Param('id') id: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.calendarsService.getAppointments(
      user.locationId!,
      id,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Post('appointments')
  book(@Body() body: BookAppointmentDto, @CurrentUser() user: AccessTokenPayload) {
    return this.calendarsService.bookAppointment(user.locationId!, body);
  }

  @Patch('appointments/:apptId/cancel')
  cancel(
    @Param('apptId') apptId: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.calendarsService.cancelAppointment(apptId, user.locationId!, body.reason);
  }

  @Patch('appointments/:apptId/reschedule')
  reschedule(
    @Param('apptId') apptId: string,
    @Body() body: { startsAt: string; endsAt?: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.calendarsService.rescheduleAppointment(apptId, user.locationId!, body.startsAt, body.endsAt);
  }
}
