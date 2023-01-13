import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { datetimeColumnType } from '../../utils/constants';
import CalDavEventEntity from './CalDavEventEntity';
import ReminderEntity from './ReminderEntity';

@Entity('caldav_event_alarms')
export default class CalDavEventAlarmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'before_start', default: true })
  beforeStart: boolean;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'time_unit' })
  timeUnit: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CalDavEventEntity, (event) => event.alarms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event: CalDavEventEntity;

  @OneToMany(() => ReminderEntity, (reminder) => reminder.caldavEventAlarm)
  reminders: ReminderEntity[];

  // constructor(event?: CalDavEventEntity) {
  //   if (event) {
  //     this.event = event;
  //   }
  // }
}
