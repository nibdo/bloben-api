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
import { formatDTEndValue, formatDTStartValue } from '../../utils/davHelper';
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

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  attendees: object;

  @Column({ name: 'organizer', type: 'json', nullable: true })
  organizer: object;

  @Column({ name: 'r_rule', nullable: true })
  rRule: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  exceptions: object;

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
      const isAllDay = data?.dtstart?.value?.length === '20220318'.length;

      this.summary = data.summary;
      this.startAt = formatDTStartValue(data, isAllDay);
      this.timezoneStartAt = isAllDay
        ? 'floating'
        : data.dtstart.timezone
        ? data.dtstart.timezone
        : defaultTimezone;
      this.endAt = formatDTEndValue(data, isAllDay);
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
