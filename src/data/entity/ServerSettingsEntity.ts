import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LOCATION_PROVIDER } from '../types/enums';
import { datetimeColumnType } from '../../utils/constants';

@Entity('server_settings')
export default class ServerSettingsEntity {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ name: 'check_new_version', default: false })
  checkNewVersion: boolean;

  @Column({ name: 'email_counter', default: 200 })
  emailCounter: number;

  @Column({ name: 'inner_email_counter', default: 0 })
  innerEmailCounter: number;

  @Column({
    name: 'location_provider',
    default: LOCATION_PROVIDER.OPEN_STREET_MAPS,
  })
  locationProvider: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;
}
