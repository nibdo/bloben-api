import { Connection, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { CreateCalDavAccountRequest } from 'bloben-interface';
import { DAV_ACCOUNT_TYPE } from '../../../data/types/enums';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CardDavAddressBook from '../../../data/entity/CardDavAddressBook';
import UserEntity from '../../../data/entity/UserEntity';

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

export const seedCardDavAddressBooks = async (
  userID: string
): Promise<{
  cardDavAccount: CalDavAccountEntity;
  cardDavAddressBook: CardDavAddressBook;
}> => {
  // @ts-ignore
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const calDavAccounts: CalDavAccountEntity[] = [];
  const cardDavAddressBooks: CardDavAddressBook[] = [];

  forEach(testAccountsDataCardDav, (account) => {
    const newAccount = new CalDavAccountEntity(account, user);
    const newBook = new CardDavAddressBook(undefined, undefined);
    newAccount.principalUrl = `http://${user.username}`;
    newAccount.serverUrl = `http://${user.username}`;
    newAccount.rootUrl = `http://${user.username}`;
    newAccount.homeUrl = `http://${user.username}`;

    newBook.url = `http://${user.username}`;
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
};
