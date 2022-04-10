import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ALARM_TYPE } from '../../bloben-interface/enums';
import CalDavEventEntity from './CalDavEventEntity';

@Entity('caldav_event_alarms')
export default class CalDavEventAlarmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'alarm_type', type: 'text', default: ALARM_TYPE.UNKNOWN })
  alarmType: ALARM_TYPE;

  @Column({ name: 'payload', nullable: true })
  payload: string;

  @Column({ name: 'before_start', default: true })
  beforeStart: boolean;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'time_unit' })
  timeUnit: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => CalDavEventEntity, (event) => event.alarms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event: CalDavEventEntity;

  // @OneToMany(() => ReminderEntity, (reminder) => reminder.eventAlarm)
  // reminders: ReminderEntity[];

  constructor(event: CalDavEventEntity) {
    if (event) {
      this.event = event;
    }
  }
}
