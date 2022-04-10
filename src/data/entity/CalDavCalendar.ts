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

import { CalendarAlarms } from '../../bloben-interface/interface';
import CalDavAccountEntity from './CalDavAccount';
import CalDavEventEntity from './CalDavEventEntity';
import CalDavTaskEntity from './CalDavTaskEntity';
import CalDavTaskSettingsEntity from './CalDavTaskSettings';

@Entity('caldav_calendars')
export default class CalDavCalendarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'display_name', nullable: false })
  displayName: string;

  @Column({ name: 'custom_display_name', nullable: true })
  customDisplayName: string;

  @Column({ name: 'data', nullable: true })
  data: string;

  @Column({ name: 'timezone', nullable: true })
  timezone: string;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'color', nullable: true })
  color: string;

  @Column({ name: 'custom_color', nullable: true })
  customColor: string;

  @Column({ name: 'ctag', nullable: true })
  ctag: string;

  @Column({ name: 'ctag_tasks', nullable: true })
  ctagTasks: string;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @Column({ type: 'timestamptz', name: 'last_update_at', nullable: true })
  lastUpdateAt: Date;

  @Column({ type: 'text', name: 'components', nullable: true, array: true })
  components: string[];

  @Column({ type: 'jsonb', nullable: true })
  alarms: CalendarAlarms[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(
    () => CalDavAccountEntity,
    (calDavAccount) => calDavAccount.calDavCalendars,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'caldav_account_id', referencedColumnName: 'id' })
  calDavAccount: CalDavAccountEntity;

  @OneToMany(() => CalDavEventEntity, (event) => event.calendar)
  events: CalDavEventEntity[];

  @OneToMany(() => CalDavTaskEntity, (task) => task.calendar)
  tasks: CalDavTaskEntity[];

  @OneToMany(
    () => CalDavTaskSettingsEntity,
    (taskSettings) => taskSettings.calendar
  )
  taskSettings: CalDavTaskSettingsEntity[];
}
