import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

import UserEntity from './UserEntity';

@Entity('user_email_config')
export default class UserEmailConfigEntity {
  @OneToOne(() => UserEntity, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({ name: 'data', nullable: false })
  data: string;

  @Column({ name: 'has_imap', default: false })
  hasImap: boolean;

  @Column({ type: 'timestamptz', name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'last_seq', nullable: true })
  lastSeq: number;

  @Column({ name: 'imap_syncing_interval', default: 15 })
  imapSyncingInterval: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  constructor(
    user: UserEntity,
    data: string,
    syncingInterval: number,
    hasImap: boolean
  ) {
    if (user) {
      this.user = user;
      this.data = data;
      this.imapSyncingInterval = syncingInterval;
      this.hasImap = hasImap;
    }
  }
}
