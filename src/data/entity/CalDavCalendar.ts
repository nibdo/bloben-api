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
import CalDavAccountEntity from './CalDavAccount';
import CalDavEventEntity from './CalDavEventEntity';
import CalDavTaskSettingsEntity from './CalDavTaskSettings';
import SharedLinkCalendarEntity from './SharedLinkCalendars';

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

  @Column({ type: datetimeColumnType, name: 'last_update_at', nullable: true })
  lastUpdateAt: Date;

  @Column({ type: 'text', name: 'components', nullable: true })
  components: string;

  @Column({ type: 'text', nullable: true })
  alarms: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
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

  @OneToMany(
    () => CalDavTaskSettingsEntity,
    (taskSettings) => taskSettings.calendar
  )
  taskSettings: CalDavTaskSettingsEntity[];

  @OneToMany(
    () => SharedLinkCalendarEntity,
    (calendar) => calendar.calDavCalendar
  )
  @JoinColumn({ name: 'caldav_calendar_id', referencedColumnName: 'id' })
  sharedLinkCalendar: SharedLinkCalendarEntity;
}
