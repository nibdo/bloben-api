import { CalDavEventObj } from '../../utils/davHelper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { DateTime } from 'luxon';
import { EVENT_TYPE, TASK_STATUS } from 'bloben-interface';
import { FLOATING_DATETIME } from 'kalend/layout/constants';
import { datetimeColumnType } from '../../utils/constants';
import { map } from 'lodash';
import {
  parseJSON,
  removeArtifacts,
  validateStringDate,
} from '../../utils/common';
import { v4 } from 'uuid';
import CalDavCalendarEntity from './CalDavCalendar';
import CalDavEventAlarmEntity from './CalDavEventAlarmEntity';
import CalDavEventExceptionEntity from './CalDavEventExceptionEntity';

export const columnJSON = {
  type: 'text',
};

@Entity('caldav_events')
export default class CalDavEventEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'external_id' })
  externalID: string;

  @Column({ name: 'href' })
  href: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: datetimeColumnType, name: 'start_at', nullable: true })
  startAt: Date;

  @Column({ name: 'timezone_start_at', nullable: true })
  timezoneStartAt: string;

  @Column({ type: datetimeColumnType, name: 'end_at', nullable: true })
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
    type: 'text',
    nullable: true,
  })
  exdates: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  attendees: string;

  @Column({ name: 'organizer', type: 'text', nullable: true })
  organizer: string;

  @Column({ name: 'recurrence_id', type: 'text', nullable: true })
  recurrenceID: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  valarms: string;

  @Column({ type: 'text', nullable: true })
  props: string;

  @Column({ name: 'etag', nullable: true })
  etag: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'varchar', default: EVENT_TYPE.EVENT })
  type: string;

  @Column({
    type: datetimeColumnType,
    name: 'external_created_at',
    nullable: true,
  })
  externalCreatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @Column({ type: datetimeColumnType, name: 'updated_at' })
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

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  status: TASK_STATUS;

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
      this.id = v4();
      if (item.startAt) {
        validateStringDate(item.startAt);
        this.startAt = DateTime.fromISO(item.startAt).toUTC().toJSDate();
      }
      if (item.endAt) {
        validateStringDate(item.endAt);
        this.endAt = DateTime.fromISO(item.endAt).toUTC().toJSDate();
      }

      const calendar = new CalDavCalendarEntity();
      calendar.id = item.calendarID;

      if (item.timezone) {
        this.timezoneStartAt = item.timezone;
        this.timezoneEndAt = item.timezone;
      }
      if (item.timezoneEnd) {
        this.timezoneEndAt = item.timezoneEnd;
      }

      if (item.status) {
        this.status = item.status;
      }

      if (item.created) {
        this.externalCreatedAt = DateTime.fromISO(item.created)
          .toUTC()
          .toJSDate();
      }

      this.type = item.type;

      if (item.type === EVENT_TYPE.TASK && item.startAt) {
        this.endAt = DateTime.fromJSDate(this.startAt)
          .plus({ minutes: 30 })
          .toUTC()
          .toJSDate();
        this.timezoneStartAt = FLOATING_DATETIME;
      }

      this.props = parseJSON(item.props);
      this.externalID = item.externalID;
      this.recurrenceID = parseJSON(item.recurrenceID);

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
      this.exdates = parseJSON(item.exdates);
      this.attendees = item.attendees
        ? JSON.stringify(
            map(item.attendees, (attendee) => ({
              ...attendee,
              CN: removeArtifacts(attendee.CN),
              mailto: removeArtifacts(attendee.mailto),
            }))
          )
        : '[]';
      this.organizer = item.organizer
        ? JSON.stringify({
            ...item.organizer,
            mailto: removeArtifacts(item.organizer?.mailto),
          } as any)
        : '{}';
      this.valarms = item.valarms ? JSON.stringify(item.valarms) : '[]';
      this.createdAt = item.created
        ? DateTime.fromISO(item.created).toUTC().toJSDate()
        : new Date();
      this.updatedAt = item.lastModified?.value
        ? DateTime.fromISO(item.lastModified?.value).toUTC().toJSDate()
        : new Date();
    }
  }
}
