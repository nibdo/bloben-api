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
import { datetimeColumnType } from '../../utils/constants';
import {
  formatDTEndValueJsDate,
  formatDTStartValueJsDate,
} from '../../utils/davHelper';
import { map } from 'lodash';
import { parseJSON, removeArtifacts } from '../../utils/common';
import ReminderEntity from './ReminderEntity';
import WebcalCalendarEntity from './WebcalCalendarEntity';
import WebcalEventExceptionEntity from './WebcalEventExceptionEntity';

@Entity('webcal_events')
export default class WebcalEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ type: datetimeColumnType, name: 'start_at' })
  startAt: Date;

  @Column({ type: datetimeColumnType, name: 'end_at' })
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
    type: 'text',
    nullable: true,
  })
  attendees: string;

  @Column({ name: 'organizer', type: 'text', nullable: true })
  organizer: string;

  @Column({ name: 'r_rule', nullable: true })
  rRule: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  exceptions: string;

  @Column({ nullable: false, default: 1 })
  sequence: number;

  @Column({ name: 'external_id', nullable: true })
  externalID: string;

  @OneToMany(
    () => WebcalEventExceptionEntity,
    (webcalEventException) => webcalEventException.externalID
  )
  webcalEventException: WebcalEventExceptionEntity[];

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @Column({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
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
      if (data.dtstart.value) {
        this.startAt = formatDTStartValueJsDate(data, isAllDay);
      }
      if (data.dtend.value) {
        this.endAt = formatDTEndValueJsDate(data, isAllDay);
      }
      this.timezoneStartAt = isAllDay
        ? 'floating'
        : data.dtstart.timezone
        ? data.dtstart.timezone
        : defaultTimezone;
      this.timezoneEndAt = isAllDay
        ? 'floating'
        : data.dtend?.timezone
        ? data.dtend?.timezone || data.dtstart?.timezone
        : defaultTimezone;
      this.externalID = data.uid;
      this.organizer = data.organizer
        ? parseJSON({
            ...data.organizer,
            mailto: removeArtifacts(data.organizer.mailto),
          } as any)
        : null;
      this.attendees = parseJSON(
        map(data.attendee, (item) => ({
          ...item,
          CN: removeArtifacts(item.CN),
          mailto: removeArtifacts(item.mailto),
        })) as any
      );
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
