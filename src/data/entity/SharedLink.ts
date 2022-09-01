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

import { DateTime } from 'luxon';
import { PostSharedLinkRequest } from 'bloben-interface';
import SharedLinkCalendarEntity from './SharedLinkCalendars';
import UserEntity from './UserEntity';

@Entity('shared_links')
export default class SharedLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'password', nullable: true })
  password: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ type: 'date', name: 'expire_at', nullable: true })
  expireAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  settings: any;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.calDavAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @OneToMany(
    () => SharedLinkCalendarEntity,
    (calendarSharedCalendar) => calendarSharedCalendar.sharedLink
  )
  sharedLinkCalendars: SharedLinkCalendarEntity[];

  constructor(body: PostSharedLinkRequest, user: UserEntity) {
    if (body) {
      this.name = body.name;
      this.password = body.password;
      this.expireAt = body.expireAt
        ? DateTime.fromISO(body.expireAt).toJSDate()
        : null;
      this.user = user;
      this.settings = body.settings;
    }
  }
}
