import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateTime } from 'luxon';
import CalDavEventAlarmEntity from './CalDavEventAlarmEntity';

export enum REMINDER_STATUS {
  INITIALIZED = 'INITIALIZED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('reminders')
export default class ReminderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userID: string;

  @Column({ name: 'was_fired', default: false })
  wasFired: boolean;

  @Column({ default: REMINDER_STATUS.INITIALIZED })
  status: REMINDER_STATUS;

  @Column({ default: 0 })
  attempt: number;

  @Column({ type: 'timestamptz', name: 'send_at', nullable: true })
  sendAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => CalDavEventAlarmEntity,
    (caldavEventAlarm) => caldavEventAlarm.reminders,
    {
      onDelete: 'CASCADE',
      nullable: true,
    }
  )
  @JoinColumn({ name: 'caldav_event_alarm_id', referencedColumnName: 'id' })
  caldavEventAlarm: CalDavEventAlarmEntity;
  //
  // @ManyToOne(() => WebcalEventEntity, {
  //   onDelete: 'CASCADE',
  //   nullable: true,
  // })
  // @JoinColumn({ name: 'webcal_event_id', referencedColumnName: 'id' })
  // webcalEvent: WebcalEventEntity;

  constructor(
    alarm?: CalDavEventAlarmEntity,
    dateString?: string,
    userID?: string
  ) {
    if (alarm) {
      this.caldavEventAlarm = alarm;
      this.sendAt = DateTime.fromISO(dateString).toJSDate();
      this.userID = userID;
    }
  }
}
