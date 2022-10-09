import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CalDavEventObj } from '../../utils/davHelper';

import { DateTime } from 'luxon';
import { TASK_STATUS } from 'bloben-interface/enums';
import CalDavCalendarEntity from './CalDavCalendar';

@Entity('caldav_tasks')
export default class CalDavTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id' })
  externalID: string;

  @Column({ name: 'href' })
  href: string;

  @Column({ type: 'timestamptz', name: 'start_at', nullable: true })
  startAt: Date;

  @Column({ name: 'all_day', default: false })
  allDay: boolean;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  status: TASK_STATUS;

  @Column({ name: 'is_repeated', default: false })
  isRepeated: boolean;

  @Column({ name: 'repeat_until', nullable: true })
  repeatUntil: Date;

  @Column({ name: 'r_rule', nullable: true })
  rRule: string;

  @Column({ nullable: true })
  data: string;

  @Column({ name: 'etag', nullable: true })
  etag: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => CalDavCalendarEntity, (calendar) => calendar.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caldav_calendar_id', referencedColumnName: 'id' })
  calendar: CalDavCalendarEntity;

  parseRRule(rRule: string | null) {
    if (rRule) {
      const partA: string = rRule.slice(0, rRule.indexOf('UNTIL'));
      const partB: string = rRule
        .slice(rRule.indexOf('UNTIL'))
        .replace(/[:-]/g, '');

      return partA + partB.slice(0, -5) + 'Z';
    }
  }

  constructor(item: CalDavEventObj) {
    if (item) {
      const calendar = new CalDavCalendarEntity();
      calendar.id = item.calendarID;

      this.externalID = item.externalID;
      this.startAt = item.startAt
        ? DateTime.fromISO(item.startAt).toUTC().toJSDate()
        : null;
      this.etag = item.etag;
      this.description = item.description;
      this.isRepeated = item.isRepeated;
      this.rRule = item.rRule;
      this.allDay = item.allDay;
      this.summary = item.summary;
      this.status = item.status;
      this.calendar = calendar;
      this.href = item.href;
      this.createdAt = item.created
        ? DateTime.fromISO(item.created).toUTC().toJSDate()
        : new Date();
      this.updatedAt = item.lastModified?.value
        ? DateTime.fromISO(item.lastModified?.value).toUTC().toJSDate()
        : new Date();
    }
  }
}
