import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ParsedContact } from '../../utils/davHelper';
import { datetimeColumnType } from '../../utils/constants';
import { parseJSON } from '../../utils/common';
import CardDavAddressBook from './CardDavAddressBook';

@Entity('carddav_contacts')
export default class CardDavContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  // @Column({ name: 'last_name', nullable: true })
  // lastName: string;

  // @Column({ name: 'nick_name', nullable: true })
  // nickName: string;

  @Column({ type: 'text', name: 'emails', nullable: true })
  emails: string;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'etag', nullable: true })
  etag: string;

  @Column({ name: 'external_id', nullable: false })
  externalID: string;

  @CreateDateColumn({ type: datetimeColumnType, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: datetimeColumnType, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: datetimeColumnType, name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', name: 'carddav_address_book_id' })
  cardDavAddressBookID: string;
  @ManyToOne(
    () => CardDavAddressBook,
    (cardDavAddressBook) => cardDavAddressBook.contacts,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'carddav_address_book_id', referencedColumnName: 'id' })
  addressBook: CardDavAddressBook;

  constructor(item: ParsedContact, addressBookID: string) {
    if (item) {
      this.url = item.url;
      this.etag = item.etag;
      this.fullName = item.data?.fullName;
      this.emails = parseJSON(item.data?.emails);
      this.externalID = item.data?.externalID;

      this.cardDavAddressBookID = addressBookID;
    }
  }
}
