import { Connection, getConnection, MigrationInterface } from 'typeorm';
import { forEach } from 'lodash';

import { testUserData } from './1-user-seed';
import UserEntity from '../../../data/entity/UserEntity';
import { CreateCalDavAccountRequest } from '../../../bloben-interface/calDavAccount/calDavAccount';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import { DAV_ACCOUNT_TYPE } from '../../../bloben-interface/enums';
import CardDavAddressBook from '../../../data/entity/CardDavAddressBook';

export const testAccountsDataCardDav: CreateCalDavAccountRequest[] = [
  {
    username: 'username1',
    password: 'aaabbbb',
    url: 'http://localhost:1000',
    accountType: DAV_ACCOUNT_TYPE.CARDDAV,
  },
  {
    username: 'username2',
    password: 'aaabbbb',
    url: 'http://localhost:2000',
    accountType: DAV_ACCOUNT_TYPE.CARDDAV,
  },
];

export class carddavAddressBooks implements MigrationInterface {
  public async up(): Promise<{
    cardDavAccount: CalDavAccountEntity;
    cardDavAddressBook: CardDavAddressBook;
  }> {
    // @ts-ignore
    const connection: Connection = await getConnection();

    const user: UserEntity | undefined = await connection.manager.findOne(
      UserEntity,
      {
        where: {
          username: testUserData.username,
        },
      }
    );

    const calDavAccounts: CalDavAccountEntity[] = [];
    const cardDavAddressBooks: CardDavAddressBook[] = [];

    forEach(testAccountsDataCardDav, (account) => {
      const newAccount = new CalDavAccountEntity(account, user);
      const newBook = new CardDavAddressBook(undefined, undefined);
      newAccount.principalUrl = `http://${testUserData.username}`;
      newAccount.url = `http://${testUserData.username}`;

      newBook.url = `http://${testUserData.username}`;
      newBook.calDavAccount = newAccount;
      newBook.displayName = 'default';
      newBook.data = { displayName: 'default' };

      calDavAccounts.push(newAccount);
      cardDavAddressBooks.push(newBook);
    });

    await connection.manager.save(calDavAccounts);
    await connection.manager.save(cardDavAddressBooks);

    return {
      cardDavAccount: calDavAccounts[0],
      cardDavAddressBook: cardDavAddressBooks[0],
    };
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
