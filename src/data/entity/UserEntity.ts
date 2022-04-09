import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';

import { AdminCreateUserRequest } from '../../bloben-interface/admin/admin';
import { GetAccountResponse } from '../../bloben-interface/user/user';
import { ROLE } from '../../bloben-interface/enums';
import CalDavAccountEntity from './CalDavAccount';
import CalendarSettingsEntity from './CalendarSettings';
import PushSubscriptionEntity from './PushSubscriptionEntity';
import UserEmailConfigEntity from './UserEmailConfig';
import WebcalCalendarEntity from './WebcalCalendarEntity';

@Entity('users')
export default class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, type: 'text', default: ROLE.DEMO })
  role: ROLE;

  @Column()
  hash: string;

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean;

  @Column({ name: 'is_two_factor_enabled', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string;

  @OneToMany(
    () => WebcalCalendarEntity,
    (externalCalendar) => externalCalendar.user
  )
  externalCalendars: WebcalCalendarEntity[];

  @OneToMany(() => CalDavAccountEntity, (calDavAccount) => calDavAccount.user)
  calDavAccounts: CalDavAccountEntity[];

  @OneToOne(() => UserEmailConfigEntity)
  emailConfig: UserEmailConfigEntity;

  @OneToOne(() => CalendarSettingsEntity)
  calendarSettings: CalendarSettingsEntity;

  @OneToMany(
    () => PushSubscriptionEntity,
    (pushSubscription) => pushSubscription.user
  )
  pushSubscriptions: PushSubscriptionEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  constructor(body: AdminCreateUserRequest) {
    if (body) {
      this.id = v4();
      this.username = body.username;
      this.role = ROLE.USER;
    }
  }

  public getAccount(): GetAccountResponse {
    return {
      username: this.username,
      userID: this.id,
      role: this.role,
    };
  }

  changePassword(hash: string) {
    this.hash = hash;
  }

  createSessionUser(id: string, role: ROLE) {
    this.id = id;
    this.role = role;

    return this;
  }
}
