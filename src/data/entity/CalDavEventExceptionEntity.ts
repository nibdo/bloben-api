import { CalDavEventObj } from '../../utils/davHelper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DateTime } from 'luxon';
import { DateTimeObject } from 'ical-js-parser';
import CalDavCalendarEntity from './CalDavCalendar';
import CalDavEventEntity from './CalDavEventEntity';

export const formatDate = (date: DateTimeObject) => {
  let result;

  if (!date?.value) {
    throw Error(`Cannot parse date ${date}`);
  }

  if (date.timezone) {
    result = DateTime.fromISO(date.value, {
      zone: date.timezone,
    })
      .toUTC()
      .toString();
  } else {
    result = DateTime.fromISO(date.value).toString();
  }

  return result;
};

@Entity('caldav_event_exceptions')
export default class CalDavEventExceptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', name: 'exception_date', nullable: true }) // original date
  exceptionDate: Date;

  @Column({ name: 'exception_timezone', nullable: true })
  exceptionTimezone: string;

  @Column({ name: 'external_id' })
  externalID: string;

  // @Column({ name: 'caldav_event_id' })
  // caldavEventID: string;
  @ManyToOne(() => CalDavEventEntity, (caldavEvent) => caldavEvent.exceptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caldav_event_id' })
  caldavEvent: CalDavEventEntity;

  @Column({ name: 'caldav_calendar_id' })
  calDavCalendarID: string;

  @ManyToOne(
    () => CalDavCalendarEntity,
    (caldavCalendar) => caldavCalendar.events,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'caldav_calendar_id', referencedColumnName: 'id' })
  caldavCalendar: CalDavCalendarEntity;

  @Column({ name: 'user_id' })
  userID: string;

  constructor(
    userID: string,
    caldavCalendarID: string,
    event: CalDavEventObj,
    exception: DateTimeObject,
    eventEntity: CalDavEventEntity
  ) {
    if (userID && event) {
      this.userID = userID;
      this.exceptionDate = formatDate(exception);
      this.exceptionTimezone = event.timezone;
      this.externalID = event.externalID;
      this.calDavCalendarID = caldavCalendarID;
      this.caldavEvent = eventEntity;
      // this.caldavEventID = eventEntity.id;
    }
  }
}
