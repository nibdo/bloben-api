import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CreatePushSubscriptionRequest } from '../../api/pushSubscription/PushSubscriptionInterface';
import UserEntity from './UserEntity';

@Entity('push_subscriptions')
export default class PushSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client', nullable: true })
  client: string;

  @Column({ name: 'auth' })
  auth: string;

  @Column({ name: 'endpoint' })
  endpoint: string;

  @Column({ name: 'p256dh' })
  p256dh: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.pushSubscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  constructor(body: CreatePushSubscriptionRequest, user: any) {
    if (body) {
      this.user = user;
      this.auth = body.subscription.keys.auth;
      this.p256dh = body.subscription.keys.p256dh;
      this.endpoint = body.subscription.endpoint;
    }
  }
}
