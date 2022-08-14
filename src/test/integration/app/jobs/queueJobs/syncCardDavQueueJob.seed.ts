import { ImportMock } from 'ts-mock-imports';
import AdminUsersService from '../../../../../api/adminUsers/AdminUsersService';
import { testUserData } from '../../../seeds/1-user-seed';
import UserRepository from '../../../../../data/repository/UserRepository';
import CalDavAccountEntity from '../../../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../../../data/repository/CalDavAccountRepository';
import { forEach, map } from 'lodash';
import { generateRandomString } from '../../../../../utils/common';
import { io } from '../../../../../app';
import { DAV_ACCOUNT_TYPE } from '../../../../../bloben-interface/enums';
import CardDavAddressBook from '../../../../../data/entity/CardDavAddressBook';
import CardDavAddressBookRepository from '../../../../../data/repository/CardDavAddressBookRepository';
import CardDavContact from '../../../../../data/entity/CardDavContact';
import { parseFromVcardString } from '../../../../../utils/vcardParser';
import { ParsedContact } from '../../../../../utils/davHelper';
import { todoToKeepID } from './syncCalDavTodoQueueJob.seed';
import CardDavContactRepository from '../../../../../data/repository/CardDavContactRepository';
const tsdav = require('tsdav');

const createTestVcal = (id: string, email?: string) =>
  `begin:vcard
  version:bloben 3.0
fn:Abadadadadad John
n:John;Abadadadadad
email;${email}
end:vcard
`;

export const vcalToInsertID = 'fd2acf38-40d7-4d33-b708-da1df05d18e1';
export const vcalToUpdateID = '1ad2b4f3-f4d3-47ff-93d2-99a8eec4c0b2';
export const vcalToKeepID = '3235e210-5678-4975-aa05-56b4747fbd4c';
export const vcalToDeleteID = 'bebdce1a-f576-2b38-9ac7-e301ab32d6f9';

const etagToKeep = 'FGHBAFJi123';

const prepareData = async (accountUrl: string, calendarUrl: string) => {
  await AdminUsersService.adminCreateUser({
    body: testUserData,
    // @ts-ignore
    session: {},
  });
  const user = await UserRepository.findByUsername(testUserData.username);
  const newAccount = new CalDavAccountEntity(
    {
      username: 'username1',
      password: 'aaabbbb',
      url: accountUrl,
      accountType: DAV_ACCOUNT_TYPE.CARDDAV,
    },
    user
  );
  newAccount.principalUrl = accountUrl;
  newAccount.url = accountUrl;

  const newAddressBook = new CardDavAddressBook(undefined, undefined);

  newAddressBook.calDavAccount = newAccount;
  newAddressBook.displayName = 'default';
  newAddressBook.data = { displayName: 'default' };
  newAddressBook.url = `${calendarUrl}`;

  await CalDavAccountRepository.getRepository().save(newAccount);
  await CardDavAddressBookRepository.getRepository().save(newAddressBook);

  const contacts: CardDavContact[] = [];

  const contactIDs = [vcalToInsertID, vcalToKeepID, vcalToDeleteID];

  const stringContacts = map(contactIDs, (id) => {
    const string = createTestVcal(id);
    const itemJson = parseFromVcardString(string);

    return {
      ...itemJson,
      etag: id === todoToKeepID ? etagToKeep : generateRandomString(20),
      url: `${calendarUrl}/${id}`,
    };
  });

  const parsedServerContacts: ParsedContact[] = map(stringContacts, (item) => {
    return {
      data: item,
      etag: item.etag,
      url: item.url,
    };
  });

  forEach(parsedServerContacts, (item) => {
    contacts.push(new CardDavContact(item, newAddressBook.id));
  });

  await CardDavContactRepository.getRepository().save(contacts);

  return user;
};

const prepareMock = (accountUrl: string, calendarUrl: string) => {
  ImportMock.restore();

  // @ts-ignore
  io = {
    to: () => {
      return {
        emit: () => {
          return;
        },
      };
    },
  };

  const mockManager = ImportMock.mockClass(tsdav, 'DAVClient');
  // @ts-ignore
  mockManager.set('login', () => {
    return;
  });

  // @ts-ignore
  mockManager.set('fetchAddressBooks', () => {
    return [
      {
        ctag: 'BGTPY123111',
        displayName: 'default',
        url: `${calendarUrl}`,
      },
    ];
  });

  // @ts-ignore
  mockManager.set('fetchVCards', () => {
    const ids = [vcalToInsertID, vcalToUpdateID, vcalToKeepID];

    return ids.map((id) => ({
      raw: '',
      href: `${calendarUrl}/${id}`,
      status: 200,
      statusText: 'Ok',
      ok: true,
      data: createTestVcal(
        id,
        id === todoToKeepID ? undefined : 'abcde@bloben.com'
      ),
      etag: id === todoToKeepID ? etagToKeep : 'xxv1v87sd4v7sd8v1sd7v',
      url: `${calendarUrl}/${id}`,
    }));
  });

  return mockManager;
};

/**
 *
 * Test insert new contact
 * Test updating existing contact
 * Test keeping not changed contact
 * Test delete contact
 *
 * Test creating new address book
 * Test updating ctag to new value
 * Test deleting address book
 */
export const initSyncCardDavQueueJobData = async (accountUrl: string) => {
  const calendarUrl = `${accountUrl}/default`;

  // prepare initial data
  const user = await prepareData(accountUrl, calendarUrl);

  // prepare mock data
  await prepareMock(accountUrl, calendarUrl);

  return user;
};
