import { Connection, getConnection, MigrationInterface } from 'typeorm';
import { forEach } from 'lodash';

import { testUserData } from './1-user-seed';
import UserEntity from '../../../data/entity/UserEntity';
import { ParsedContact } from '../../../utils/davHelper';
import { v4 } from 'uuid';
import { CreateCardDavContactRequest } from '../../../bloben-interface/cardDavContact/cardDavContact';
import CardDavContact from '../../../data/entity/CardDavContact';
import CardDavAddressBook from '../../../data/entity/CardDavAddressBook';

export const testContactsData: CreateCardDavContactRequest[] = [
  {
    addressBookID: '',
    email: 'aaa@bloben.com',
    fullName: 'info',
  },
  {
    addressBookID: '',
    email: 'aaa@bloben.com',
    fullName: 'info',
  },
  {
    addressBookID: '',
    email: 'aaa@bloben.com',
    fullName: 'info',
  },
];

export class cardDavContacts implements MigrationInterface {
  public async up(): Promise<{
    contact: CardDavContact;
  }> {
    // @ts-ignore
    const connection: Connection = await getConnection();

    const [user, addressBook] = await Promise.all([
      connection.manager.findOne(UserEntity, {
        where: {
          username: testUserData.username,
        },
      }),
      connection.manager.findOne(CardDavAddressBook, {
        where: {
          url: `http://${testUserData.username}`,
        },
      }),
    ]);

    const contacts: CardDavContact[] = [];

    forEach(testContactsData, (contact) => {
      const data: ParsedContact = {
        data: {
          externalID: v4(),
          emails: [contact.email],
          fullName: contact.fullName,
        },
        etag: 'asadasf',
        url: 'http://localhost/102',
      };
      contacts.push(new CardDavContact(data, addressBook.id));
    });

    await connection.manager.save(contacts);

    return { contact: contacts[0] };
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
