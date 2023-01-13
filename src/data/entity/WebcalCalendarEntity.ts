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
import { CreateWebcalCalendarRequest } from 'bloben-interface';
import { datetimeColumnType } from '../../utils/constants';
import { parseJSON } from '../../utils/common';
import SharedLinkCalendarEntity from './SharedLinkCalendars';
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

  @Column({ name: 'sync_frequency', default: 10 }) // hours
  syncFrequency: number;

  @Column({ default: 0 })
  attempt: number;

  @Column({ type: 'text', nullable: true })
  alarms: string;

  @Column({ type: datetimeColumnType, name: 'last_sync_at', nullable: true }) // prevent spamming sync
  lastSyncAt: Date;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @Column({ name: 'user_mailto', nullable: true })
  userMailto: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
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

  @OneToMany(
    () => SharedLinkCalendarEntity,
    (sharedLink) => sharedLink.webcalCalendar
  )
  @JoinColumn({ name: 'webcal_calendar_id', referencedColumnName: 'id' })
  sharedLinkCalendar: SharedLinkCalendarEntity;

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
      this.alarms = parseJSON(body.alarms);
      this.userMailto = body.userMailto;
    }
  }

  public update = (body: CreateWebcalCalendarRequest) => {
    this.url = body.url;
    this.color = body.color;
    this.name = body.name;
    this.syncFrequency = body.syncFrequency;
    this.userMailto = body.userMailto;
  };
}
