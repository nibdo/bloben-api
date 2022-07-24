import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CalDavEventObj } from '../../utils/davHelper';
import { DateTime } from 'luxon';
import { map } from 'lodash';
import { removeArtifacts, validateStringDate } from '../../utils/common';
import CalDavCalendarEntity from './CalDavCalendar';
import CalDavEventAlarmEntity from './CalDavEventAlarmEntity';
import CalDavEventExceptionEntity from './CalDavEventExceptionEntity';

export const columnJSON = {
  type: 'jsonb',
  array: false,
  default: () => "'[]'",
  nullable: true,
};

@Entity('caldav_events')
export default class CalDavEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id' })
  externalID: string;

  @Column({ name: 'href' })
  href: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'timestamptz', name: 'start_at' })
  startAt: Date;

  @Column({ name: 'timezone_start_at', nullable: true })
  timezoneStartAt: string;

  @Column({ type: 'timestamptz', name: 'end_at' })
  endAt: Date;

  @Column({ name: 'timezone_end_at', nullable: true })
  timezoneEndAt: string;

  @Column({ name: 'all_day', default: false })
  allDay: boolean;

  @Column({ name: 'is_repeated', default: false })
  isRepeated: boolean;

  @Column({ name: 'repeat_until', nullable: true })
  repeatUntil: Date;

  @Column({ name: 'r_rule', nullable: true })
  rRule: string;

  @Column({ nullable: true })
  data: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  exdates: object[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  attendees: object[];

  @Column({ name: 'organizer', type: 'json', nullable: true })
  organizer: object;

  @Column({ name: 'recurrence_id', type: 'json', nullable: true })
  recurrenceID: object;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  valarms: object[];

  @Column({ type: 'json', nullable: true })
  props: object;

  @Column({ name: 'etag', nullable: true })
  etag: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', name: 'caldav_calendar_id' })
  calendarID: string;

  @ManyToOne(() => CalDavCalendarEntity, (calendar) => calendar.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caldav_calendar_id', referencedColumnName: 'id' })
  calendar: CalDavCalendarEntity;

  @OneToMany(() => CalDavEventAlarmEntity, (alarm) => alarm.event)
  alarms: CalDavEventAlarmEntity[];

  @OneToMany(
    () => CalDavEventExceptionEntity,
    (exception) => exception.caldavEvent
  )
  exceptions: CalDavEventExceptionEntity[];

  parseRRule(rRule: string | null) {
    if (rRule) {
      const partA: string = rRule.slice(0, rRule.indexOf('UNTIL'));
      const partB: string = rRule
        .slice(rRule.indexOf('UNTIL'))
        .replace(/[:-]/g, '');

      return partA + partB.slice(0, -5) + 'Z';
    }
  }

  constructor(item?: CalDavEventObj) {
    if (item) {
      validateStringDate(item.startAt);
      validateStringDate(item.endAt);

      const calendar = new CalDavCalendarEntity();
      calendar.id = item.calendarID;

      this.props = item.props;
      this.externalID = item.externalID;
      this.recurrenceID = item.recurrenceID;
      this.startAt = DateTime.fromISO(item.startAt).toUTC().toJSDate();
      this.endAt = DateTime.fromISO(item.endAt).toUTC().toJSDate();
      this.timezoneStartAt = item.timezone;
      this.timezoneEndAt = item.timezone;
      this.etag = item.etag;
      this.allDay = item.allDay;
      this.color = item.color || null;
      this.location = item.location;
      this.description = item.description;
      this.isRepeated = item.isRepeated;
      this.rRule = item.rRule;
      this.summary = item.summary;
      this.calendar = calendar;
      this.href = item.href;
      this.exdates = item.exdates || [];
      this.attendees = item.attendees
        ? map(item.attendees, (attendee) => ({
            ...attendee,
            CN: removeArtifacts(attendee.CN),
            mailto: removeArtifacts(attendee.mailto),
          }))
        : [];
      this.organizer = item.organizer
        ? ({
            ...item.organizer,
            mailto: removeArtifacts(item.organizer?.mailto),
          } as any)
        : null;
      this.valarms = item.valarms || [];
      this.createdAt = item.created
        ? DateTime.fromISO(item.created).toUTC().toJSDate()
        : new Date();
      this.updatedAt = item.lastModified?.value
        ? DateTime.fromISO(item.lastModified?.value).toUTC().toJSDate()
        : new Date();
    }
  }
}
