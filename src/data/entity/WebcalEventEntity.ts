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
import { map } from 'lodash';
import { removeArtifacts } from '../../utils/common';
import ReminderEntity from './ReminderEntity';
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

  @Column({ type: 'uuid', name: 'external_calendar_id' })
  externalCalendarID: string;

  @ManyToOne(
    () => WebcalCalendarEntity,
    (webcalCalendar) => webcalCalendar.webcalEvents,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'external_calendar_id', referencedColumnName: 'id' })
  webcalCalendar: WebcalCalendarEntity;

  @OneToMany(() => ReminderEntity, (reminder) => reminder.webcalEvent)
  reminders: ReminderEntity[];

  public setData = (
    data: EventJSON,
    defaultTimezone: string,
    webcalCalendar?: WebcalCalendarEntity,
    webcalCalendarID?: string
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
      this.organizer = data.organizer
        ? ({
            ...data.organizer,
            mailto: removeArtifacts(data.organizer.mailto),
          } as any)
        : null;
      this.attendees = map(data.attendee, (item) => ({
        ...item,
        CN: removeArtifacts(item.CN),
        mailto: removeArtifacts(item.mailto),
      })) as any;
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

      if (webcalCalendarID) {
        this.externalCalendarID = webcalCalendarID;
      }

      return this;
    }
  };
}
