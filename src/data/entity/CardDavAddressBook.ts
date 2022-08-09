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

import { DAVCollection } from 'tsdav';
import CalDavAccountEntity from './CalDavAccount';
import CardDavContact from './CardDavContact';

@Entity('carddav_address_books')
export default class CardDavAddressBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'display_name', nullable: false })
  displayName: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: object;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'ctag', nullable: true })
  ctag: string;

  @Column({ type: 'text', name: 'resource_type', nullable: true, array: true })
  resourceType: string[];

  @Column({ type: 'timestamptz', name: 'last_update_at', nullable: true })
  lastUpdateAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', name: 'caldav_account_id' })
  caldavAccountID: string;
  @ManyToOne(
    () => CalDavAccountEntity,
    (calDavAccount) => calDavAccount.calDavCalendars,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'caldav_account_id', referencedColumnName: 'id' })
  calDavAccount: CalDavAccountEntity;

  @OneToMany(() => CardDavContact, (contact) => contact.addressBook)
  contacts: CardDavContact[];

  constructor(data: DAVCollection, caldavAccountID: string) {
    if (data) {
      this.url = data.url;
      this.resourceType = data.resourcetype;
      this.displayName = data.displayName;
      this.ctag = data.ctag;
      this.caldavAccountID = caldavAccountID;
      this.data = data;
    }
  }
}
