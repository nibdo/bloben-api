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

import { CreateCalDavAccountRequest } from 'bloben-interface';
import { datetimeColumnType } from '../../utils/constants';
import CalDavCalendarEntity from './CalDavCalendar';
import CardDavAddressBook from './CardDavAddressBook';
import UserEntity from './UserEntity';

@Entity('caldav_accounts')
export default class CalDavAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'username', nullable: false })
  username: string;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'server_url', nullable: true })
  serverUrl: string;

  @Column({ name: 'root_url', nullable: true })
  rootUrl: string;

  @Column({ name: 'home_url', nullable: true })
  homeUrl: string;

  @Column({ name: 'principal_url', nullable: false })
  principalUrl: string;

  @Column({ name: 'account_type', nullable: true })
  accountType: string;

  @Column({ name: 'data', nullable: true })
  data: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
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

  @OneToMany(
    () => CardDavAddressBook,
    (addressBook) => addressBook.calDavAccount
  )
  addressBooks: CardDavAddressBook[];

  constructor(body?: CreateCalDavAccountRequest, user?: UserEntity) {
    if (body) {
      this.username = body.username;
      this.password = body.password;
      this.serverUrl = body.url;
      this.user = user;
      this.accountType = body.accountType;
    }
  }
}
