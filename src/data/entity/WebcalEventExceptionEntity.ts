import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DateTimeObject, EventJSON } from 'ical-js-parser';
import { datetimeColumnType } from '../../utils/constants';
import { formatDate } from './CalDavEventExceptionEntity';
import WebcalCalendarEntity from './WebcalCalendarEntity';

@Entity('webcal_event_exceptions')
export default class WebcalEventExceptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: datetimeColumnType, name: 'exception_date', nullable: true }) // original date
  exceptionDate: Date;

  @Column({ name: 'exception_timezone', nullable: true })
  exceptionTimezone: string;

  @Column({ name: 'external_id' })
  externalID: string;

  @Column({ name: 'webcal_calendar_id' })
  webcalCalendarID: string;

  @ManyToOne(
    () => WebcalCalendarEntity,
    (webcalCalendar) => webcalCalendar.webcalEvents,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'webcal_calendar_id', referencedColumnName: 'id' })
  webcalCalendar: WebcalCalendarEntity;

  @Column({ name: 'user_id' })
  userID: string;

  // private formatDate(event: EventJSON): { zone: string; date: string } {
  //   let stringDate: string;
  //
  //   if (typeof event.recurrenceId !== 'string' && event.recurrenceId?.TZID) {
  //     stringDate = event.recurrenceId.TZID;
  //   } else {
  //     stringDate = event.recurrenceId as unknown as string;
  //   }
  //
  //   const hasDelimiter: boolean = stringDate.indexOf(':') !== -1;
  //   const [zone, date] = hasDelimiter
  //     ? stringDate.split(':')
  //     : [null, stringDate];
  //
  //   const dateParsed: string = zone
  //     ? DateTime.fromISO(date, { zone }).toUTC().toString()
  //     : DateTime.fromISO(date).toUTC().toString();
  //
  //   return {
  //     zone,
  //     date: dateParsed,
  //   };
  // }

  constructor(
    userID: string,
    webcalCalendarID: string,
    event: EventJSON,
    exception: DateTimeObject
  ) {
    if (userID) {
      this.userID = userID;
      this.exceptionDate = formatDate(exception);
      this.exceptionTimezone = exception.timezone;
      this.externalID = event.uid;
      this.webcalCalendarID = webcalCalendarID;
    }
  }
}
