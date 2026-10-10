import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './calendar.entity';
import { Appointment } from './appointment.entity';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar, Appointment])],
  controllers: [CalendarsController],
  providers: [CalendarsService],
  exports: [CalendarsService, TypeOrmModule],
})
export class CalendarsModule {}
