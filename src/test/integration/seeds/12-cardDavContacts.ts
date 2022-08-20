import { Connection, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { CreateCardDavContactRequest } from '../../../bloben-interface/cardDavContact/cardDavContact';
import { ParsedContact } from '../../../utils/davHelper';
import { seedCardDavAddressBooks } from './11-cardDavAddressBooks';
import { v4 } from 'uuid';
import CardDavContact from '../../../data/entity/CardDavContact';
import UserEntity from '../../../data/entity/UserEntity';

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

export const seedContacts = async (
  userID: string
): Promise<{
  contact: CardDavContact;
}> => {
  // @ts-ignore
  const connection: Connection = await getConnection();

  const user = await connection.manager.findOne(UserEntity, {
    where: {
      id: userID,
    },
  });

  const { cardDavAddressBook } = await seedCardDavAddressBooks(user.id);

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
    contacts.push(new CardDavContact(data, cardDavAddressBook.id));
  });

  await connection.manager.save(contacts);

  return { contact: contacts[0] };
};
