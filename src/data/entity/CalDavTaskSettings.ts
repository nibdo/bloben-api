import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { datetimeColumnType } from '../../utils/constants';
import CalDavCalendarEntity from './CalDavCalendar';

@Entity('caldav_task_settings')
export default class CalDavTaskSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_by', nullable: false, default: 'createdAt' })
  orderBy: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  order: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => CalDavCalendarEntity, (calendar) => calendar.taskSettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caldav_calendar_id', referencedColumnName: 'id' })
  calendar: CalDavCalendarEntity;
}
