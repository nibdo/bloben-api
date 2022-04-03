import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DateTime } from 'luxon';
import { EventJSON } from 'ical-js-parser';
import WebcalCalendarEntity from './WebcalCalendarEntity';
import WebcalEventExceptionEntity from './WebcalEventExceptionEntity';

@Entity('webcal_events')
export default class WebcalEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ type: 'timestamptz', name: 'start_at' })
  startAt: Date;

  @Column({ type: 'timestamptz', name: 'end_at' })
  endAt: Date;

  @Column({ name: 'timezone_start_at', nullable: true })
  timezoneStartAt: string;

  @Column({ name: 'timezone_end_at', nullable: true })
  timezoneEndAt: string;

  @Column({ name: 'all_day' })
  allDay: boolean;

  @Column({ name: 'is_repeated' })
  isRepeated: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'json' })
  attendees: JSON;

  @Column({ nullable: true, type: 'json' })
  organizer: JSON;

  @Column({ name: 'r_rule', nullable: true })
  rRule: string;

  @Column({ name: 'exceptions', nullable: true, type: 'json' })
  exceptions: JSON;

  @Column({ nullable: false, default: 1 })
  sequence: number;

  @Column({ name: 'external_id', nullable: true })
  externalID: string;

  @OneToMany(
    () => WebcalEventExceptionEntity,
    (webcalEventException) => webcalEventException.externalID
  )
  webcalEventException: WebcalEventExceptionEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(
    () => WebcalCalendarEntity,
    (webcalCalendar) => webcalCalendar.webcalEvents,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'external_calendar_id', referencedColumnName: 'id' })
  webcalCalendar: WebcalCalendarEntity;

  public setData = (
    data: EventJSON,
    defaultTimezone: string,
    webcalCalendar?: WebcalCalendarEntity
  ) => {
    if (data !== null && webcalCalendar !== null && data?.dtstart) {
      const startDateTime: DateTime = DateTime.fromISO(data.dtstart.value);
      const endDateTime: DateTime = DateTime.fromISO(
        data.dtend?.value ? data.dtend.value : data.dtstart.value
      );
      this.summary = data.summary;
      this.startAt = startDateTime.toUTC().toJSDate();
      this.timezoneStartAt = data.dtstart.timezone
        ? data.dtstart.timezone
        : defaultTimezone;
      this.endAt = endDateTime.toUTC().toJSDate();
      this.timezoneEndAt = this.timezoneStartAt;
      this.externalID = data.uid;
      this.organizer = data.organizer as any;
      this.attendees = data.attendee as any;
      this.description = data.description;
      this.location = data.location;
      this.updatedAt = DateTime.fromISO(data.lastModified?.value)
        .toUTC()
        .toJSDate();
      this.sequence = Number(data.sequence);
      this.rRule = data.rrule;
      this.isRepeated = data.rrule?.length > 1;
      this.allDay = data.dtstart.isAllDay ? data.dtstart.isAllDay : false;
      if (webcalCalendar) {
        this.webcalCalendar = webcalCalendar;
      }

      return this;
    }
  };
}
