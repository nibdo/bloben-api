import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

import { CALENDAR_VIEW } from 'kalend-layout';
import UserEntity from './UserEntity';

@Entity('calendar_settings')
export default class CalendarSettingsEntity {
  @OneToOne(() => UserEntity, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({ name: 'time_format', nullable: false, default: 24 })
  timeFormat: number;

  @Column({ name: 'start_of_week', nullable: false, default: 'Monday' })
  startOfWeek: string;

  @Column({ name: 'show_week_numbers', nullable: false, default: false })
  showWeekNumbers: boolean;

  @Column({
    name: 'default_view',
    nullable: false,
    default: CALENDAR_VIEW.WEEK,
  })
  defaultView: string;

  @Column({ name: 'hour_height', nullable: false, default: 40 })
  hourHeight: number;

  @Column({ type: 'uuid', name: 'default_calendar_id', nullable: true })
  defaultCalendarID: string;

  @Column({ name: 'timezone', nullable: true })
  timezone: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
