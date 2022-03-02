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
import { CreateWebcalCalendarRequest } from '../../bloben-interface/webcalCalendar/webcalCalendar';
import UserEntity from './UserEntity';
import WebcalEventEntity from './WebcalEventEntity';

@Entity('webcal_calendars')
export default class WebcalCalendarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  url: string;

  @Column({ nullable: false })
  name: string;

  @Column()
  color: string;

  @Column({ name: 'sync_frequency', default: 320 }) // minutes
  syncFrequency: number;

  @Column({ default: 0 })
  attempt: number;

  @Column({ type: 'timestamptz', name: 'last_sync_at', nullable: true }) // prevent spamming sync
  lastSyncAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', name: 'user_id' })
  userID: string;
  @ManyToOne(() => UserEntity, (user) => user.externalCalendars, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @OneToMany(
    () => WebcalEventEntity,
    (webcalEvent) => webcalEvent.webcalCalendar
  )
  webcalEvents: WebcalEventEntity[];

  // constructor(data: string) {
  //   if (data) {
  //     this.data = data;
  //   }
  // }

  public onSuccess = () => {
    this.lastSyncAt = new Date();
    this.attempt = 0;
  };

  public onFail = () => {
    this.attempt = this.attempt + 1;
  };

  constructor(body?: CreateWebcalCalendarRequest, user?: UserEntity) {
    if (body && user) {
      this.url = body.url;
      this.color = body.color;
      this.name = body.name;
      this.user = user;
      this.syncFrequency = body.syncFrequency;
    }
  }

  public update = (body: CreateWebcalCalendarRequest) => {
    this.url = body.url;
    this.color = body.color;
    this.name = body.name;
    this.syncFrequency = body.syncFrequency;
  };
}
