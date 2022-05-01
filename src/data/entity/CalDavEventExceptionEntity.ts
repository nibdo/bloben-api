import { CalDavEventObj } from '../../utils/davHelper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DateTime } from 'luxon';
import CalDavCalendarEntity from './CalDavCalendar';
import CalDavEventEntity from './CalDavEventEntity';

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
    exception: string,
    eventEntity: CalDavEventEntity
  ) {
    if (userID && event) {
      this.userID = userID;
      this.exceptionDate = DateTime.fromISO(exception).toJSDate();
      this.exceptionTimezone = event.timezone;
      this.externalID = event.externalID;
      this.calDavCalendarID = caldavCalendarID;
      this.caldavEvent = eventEntity;
    }
  }
}
