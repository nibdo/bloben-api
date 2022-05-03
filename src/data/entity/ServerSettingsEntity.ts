import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('server_settings')
export default class ServerSettingsEntity {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ name: 'check_new_version', default: false })
  checkNewVersion: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
