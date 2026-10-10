import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Calendar } from './calendar.entity';
import { Appointment } from './appointment.entity';

export interface CreateCalendarDto {
  name: string;
  type?: string;
  timezone?: string;
  description?: string;
  slug?: string;
  availability?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface BookAppointmentDto {
  calendarId: string;
  contactId: string;
  title?: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
  zoomLink?: string;
  customFields?: Record<string, unknown>;
}

@Injectable()
export class CalendarsService {
  constructor(
    @InjectRepository(Calendar) private readonly calRepo: Repository<Calendar>,
    @InjectRepository(Appointment) private readonly apptRepo: Repository<Appointment>,
  ) {}

  async findAll(locationId: string): Promise<Calendar[]> {
    return this.calRepo.find({ where: { locationId }, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string, locationId: string): Promise<Calendar> {
    const cal = await this.calRepo.findOne({ where: { id, locationId } });
    if (!cal) throw new NotFoundException('Calendar not found');
    return cal;
  }

  async create(locationId: string, dto: CreateCalendarDto): Promise<Calendar> {
    return this.calRepo.save(
      this.calRepo.create({
        locationId,
        name: dto.name,
        type: dto.type ?? 'service',
        timezone: dto.timezone ?? 'Africa/Johannesburg',
        description: dto.description ?? null,
        slug: dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-'),
        availability: dto.availability ?? {},
        settings: dto.settings ?? {},
      }),
    );
  }

  async update(id: string, locationId: string, dto: Partial<CreateCalendarDto>): Promise<Calendar> {
    const cal = await this.findOne(id, locationId);
    Object.assign(cal, dto);
    return this.calRepo.save(cal);
  }

  async remove(id: string, locationId: string): Promise<void> {
    await this.findOne(id, locationId);
    await this.calRepo.delete(id);
  }

  // ─── Appointments ──────────────────────────────────────────────────────────
  async getAppointments(
    locationId: string,
    calendarId?: string,
    from?: Date,
    to?: Date,
  ): Promise<Appointment[]> {
    const qb = this.apptRepo
      .createQueryBuilder('appt')
      .where('appt.location_id = :locationId', { locationId });

    if (calendarId) qb.andWhere('appt.calendar_id = :calendarId', { calendarId });
    if (from) qb.andWhere('appt.starts_at >= :from', { from });
    if (to) qb.andWhere('appt.starts_at <= :to', { to });

    return qb.orderBy('appt.starts_at', 'ASC').getMany();
  }

  async findAppointment(id: string, locationId: string): Promise<Appointment> {
    const appt = await this.apptRepo.findOne({ where: { id, locationId } });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async bookAppointment(locationId: string, dto: BookAppointmentDto): Promise<Appointment> {
    const cal = await this.findOne(dto.calendarId, locationId);

    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt
      ? new Date(dto.endsAt)
      : new Date(startsAt.getTime() + 60 * 60 * 1000); // default 1 hour

    if (endsAt <= startsAt) throw new BadRequestException('endsAt must be after startsAt');

    // Basic conflict check on the same calendar
    const conflict = await this.apptRepo
      .createQueryBuilder('a')
      .where('a.calendar_id = :calId', { calId: cal.id })
      .andWhere('a.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('a.starts_at < :endsAt AND a.ends_at > :startsAt', { startsAt, endsAt })
      .getOne();

    if (conflict) throw new BadRequestException('This time slot is already booked');

    return this.apptRepo.save(
      this.apptRepo.create({
        calendarId: cal.id,
        locationId,
        contactId: dto.contactId,
        title: dto.title ?? `Appointment with ${dto.contactId}`,
        startsAt,
        endsAt,
        status: 'confirmed',
        notes: dto.notes ?? null,
        meetingLink: dto.zoomLink ?? null,
        customFields: dto.customFields ?? {},
      }),
    );
  }

  async cancelAppointment(id: string, locationId: string, reason?: string): Promise<Appointment> {
    const appt = await this.findAppointment(id, locationId);
    if (appt.status === 'cancelled') throw new BadRequestException('Already cancelled');
    appt.status = 'cancelled';
    if (reason) appt.notes = `Cancelled: ${reason}\n${appt.notes ?? ''}`.trim();
    return this.apptRepo.save(appt);
  }

  async rescheduleAppointment(
    id: string,
    locationId: string,
    startsAt: string,
    endsAt?: string,
  ): Promise<Appointment> {
    const appt = await this.findAppointment(id, locationId);
    appt.startsAt = new Date(startsAt);
    appt.endsAt = endsAt ? new Date(endsAt) : new Date(new Date(startsAt).getTime() + 60 * 60 * 1000);
    appt.status = 'rescheduled';
    return this.apptRepo.save(appt);
  }

  async getUpcoming(locationId: string, contactId?: string): Promise<Appointment[]> {
    const qb = this.apptRepo
      .createQueryBuilder('a')
      .where('a.location_id = :locationId', { locationId })
      .andWhere('a.starts_at > NOW()')
      .andWhere("a.status NOT IN ('cancelled')")
      .orderBy('a.starts_at', 'ASC')
      .take(50);

    if (contactId) qb.andWhere('a.contact_id = :contactId', { contactId });
    return qb.getMany();
  }
}
