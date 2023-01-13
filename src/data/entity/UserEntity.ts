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

import { AdminCreateUserRequest, GetProfileResponse } from 'bloben-interface';
import { ROLE } from '../types/enums';
import { datetimeColumnType } from '../../utils/constants';
import CalDavAccountEntity from './CalDavAccount';
import CalendarSettingsEntity from './CalendarSettings';
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

  @Column({ nullable: false, type: 'varchar', length: 2, default: 'en' })
  language: string;

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean;

  @Column({ name: 'is_two_factor_enabled', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string;

  @Column({ name: 'emails_allowed', default: true })
  emailsAllowed: boolean;

  @OneToMany(
    () => WebcalCalendarEntity,
    (externalCalendar) => externalCalendar.user
  )
  externalCalendars: WebcalCalendarEntity[];

  @OneToMany(() => CalDavAccountEntity, (calDavAccount) => calDavAccount.user)
  calDavAccounts: CalDavAccountEntity[];

  @OneToMany(() => UserEmailConfigEntity, (config) => config.user)
  emailConfig: UserEmailConfigEntity[];

  @OneToOne(() => CalendarSettingsEntity)
  calendarSettings: CalendarSettingsEntity;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
  deletedAt: Date;

  constructor(body: AdminCreateUserRequest) {
    if (body) {
      this.id = v4();
      this.username = body.username;
      this.role = ROLE.USER;
    }
  }

  public getProfile(): GetProfileResponse {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      isTwoFactorEnabled: this.isTwoFactorEnabled,
      language: this.language,
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
