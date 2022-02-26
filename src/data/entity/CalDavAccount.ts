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

import { CreateCalDavAccountRequest } from '../../bloben-interface/calDavAccount/calDavAccount';
import CalDavCalendarEntity from './CalDavCalendar';
import UserEntity from './UserEntity';

@Entity('caldav_accounts')
export default class CalDavAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'username', nullable: false })
  username: string;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'url', nullable: false })
  url: string;

  @Column({ name: 'principal_url', nullable: false })
  principalUrl: string;

  @Column({ name: 'account_type', nullable: true })
  accountType: string;

  @Column({ name: 'data', nullable: true })
  data: string;

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
    () => CalDavCalendarEntity,
    (calDavCalendar) => calDavCalendar.calDavAccount
  )
  calDavCalendars: CalDavCalendarEntity[];

  constructor(body?: CreateCalDavAccountRequest, user?: UserEntity) {
    if (body) {
      this.username = body.username;
      this.password = body.password;
      this.url = body.url;
      this.user = user;
    }
  }
}
