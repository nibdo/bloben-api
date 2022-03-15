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
  @OneToOne(() => UserEntity, { primary: true, cascade: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({ name: 'data', nullable: false })
  data: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  constructor(user: UserEntity, data: string) {
    if (user) {
      this.user = user;
      this.data = data;
    }
  }
}
