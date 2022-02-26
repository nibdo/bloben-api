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

import CalDavAccountEntity from './CalDavAccount';
import CalDavEventEntity from './CalDavEventEntity';

@Entity('caldav_calendars')
export default class CalDavCalendarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'display_name', nullable: false })
  displayName: string;

  // @Column({ name: 'principal_url', nullable: false })
  // principalUrl: string;

  @Column({ name: 'data', nullable: true })
  data: string;

  @Column({ name: 'timezone', nullable: true })
  timezone: string;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'color', nullable: true })
  color: string;

  @Column({ name: 'ctag', nullable: true })
  ctag: string;

  @Column({ type: 'timestamptz', name: 'last_update_at', nullable: true })
  lastUpdateAt: Date;

  @Column({ type: 'json', name: 'components', nullable: true })
  components: string[];

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
}
