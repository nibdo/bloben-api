import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CreateUserEmailConfigRequest } from 'bloben-interface';
import { datetimeColumnType } from '../../utils/constants';
import { parseJSON } from '../../utils/common';
import CalDavCalendarEntity from './CalDavCalendar';
import UserEntity from './UserEntity';

@Entity('user_email_config')
export default class UserEmailConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: false })
  userID: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({ name: 'data', nullable: false })
  data: string;

  @Column({ name: 'has_imap', default: false })
  hasImap: boolean;

  @Column({ type: 'text', name: 'aliases', nullable: true })
  aliases: string;

  @Column({ name: 'default_alias', nullable: true })
  defaultAlias: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ type: datetimeColumnType, name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'last_seq', nullable: true })
  lastSeq: number;

  @Column({ name: 'imap_syncing_interval', default: 15 })
  imapSyncingInterval: number;

  @Column({ name: 'calendar_for_import_id', default: null })
  calendarForImportID: string;
  @OneToOne(() => CalDavCalendarEntity)
  @JoinColumn({ name: 'calendar_for_import_id', referencedColumnName: 'id' })
  calendarForImport: CalDavCalendarEntity;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  constructor(
    userID: string,
    data: string,
    body: CreateUserEmailConfigRequest,
    hasImap: boolean
  ) {
    if (userID) {
      this.userID = userID;
      this.data = data;
      this.imapSyncingInterval = body.imapSyncingInterval;
      this.hasImap = hasImap;
      this.aliases = parseJSON(body.aliases);
      this.calendarForImportID = body.calendarForImportID;
      this.defaultAlias = body.defaultAlias;
    }
  }
}
