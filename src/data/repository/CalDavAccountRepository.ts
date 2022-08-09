import { EntityRepository, Repository, getRepository } from 'typeorm';

import { DAVCalendar } from 'tsdav';
import { DAV_ACCOUNT_TYPE } from '../../bloben-interface/enums';
import { forEach, groupBy } from 'lodash';
import { getOneResult } from '../../utils/common';
import CalDavAccountEntity from '../entity/CalDavAccount';

interface CardDavAccountRaw {
  id: string;
  url: string;
  userID: string;
  username: string;
  password: string;
  principalUrl: string;
  accountData: any;
  data: any;
  addressBookID: string;
  addressBookDescription: string;
  addressBookUrl: string;
  addressBookLastUpdateAt: string;
}

export interface AddressBook {
  id: string;
  url: string;
  data: any;
  description: string;
  lastUpdateAt: string;
}

export interface CardDavAccountWithAddressBooks {
  id: string;
  userID: string;
  url: string;
  data: any;
  username: string;
  password: string;
  principalUrl: string;
  addressBooks: AddressBook[];
}

export interface CalDavAccount {
  id: string;
  url: string;
  username: string;
  password: string;
  principalUrl: string;
}

export interface CalendarFromAccount extends DAVCalendar {
  ctagTasks?: string | null;
  id: string;
  lastUpdateAt?: any;
  color: string;
  url: string;
}

interface BaseAccount {
  id: string;
  url: string;
  userID: string;
  username: string;
  password: string;
  principalUrl: string;
  calendarID: string;
  calendarColor: string;
  calendarUrl: string;
  calendarLastUpdateAt?: string;
  ctagTasks?: string | null;
}
export interface AccountRaw extends BaseAccount {
  calendar: string;
}

export interface AccountWithCalendars extends BaseAccount {
  calendars?: CalendarFromAccount[];
  calendar?: CalendarFromAccount;
}

export type AccountWithAddressBooks = CardDavAccountWithAddressBooks;

@EntityRepository(CalDavAccountEntity)
export default class CalDavAccountRepository extends Repository<CalDavAccountEntity> {
  public static getRepository() {
    return getRepository(CalDavAccountEntity);
  }

  public static async create(data: CalDavAccountEntity) {
    return getRepository(CalDavAccountEntity).save(data);
  }

  public static async getByID(
    id: string,
    userID: string
  ): Promise<CalDavAccount | null> {
    const result: any = await getRepository(CalDavAccountEntity).query(
      `
      SELECT 
        id,
        url,
        username,
        password,
        principal_url as "principalUrl"
      FROM 
        caldav_accounts
      WHERE 
        id = $1
        AND user_id = $2
        AND account_type = 'caldav'
        AND deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }

  public static async getByIDAllTypes(
    id: string,
    userID: string
  ): Promise<CalDavAccount | null> {
    const result: any = await getRepository(CalDavAccountEntity).query(
      `
      SELECT 
        id,
        url,
        username,
        password,
        principal_url as "principalUrl"
      FROM 
        caldav_accounts
      WHERE
        id = $1
        AND user_id = $2
        AND deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }

  public static async getCardDavByID(
    id: string,
    userID: string
  ): Promise<CalDavAccount | null> {
    const result: any = await getRepository(CalDavAccountEntity).query(
      `
      SELECT 
        id,
        url,
        username,
        password,
        principal_url as "principalUrl"
      FROM 
        caldav_accounts
      WHERE
        id = $1
        AND user_id = $2
        AND account_type = 'carddav'
        AND deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }

  public static async getCardDavByAddressBookID(
    id: string,
    userID: string
  ): Promise<CalDavAccount | null> {
    const result: any = await getRepository(CalDavAccountEntity).query(
      `
      SELECT 
        ca.id as id,
        ca.url as url,
        ca.username as username,
        ca.password as password,
        ca.principal_url as "principalUrl"
      FROM 
        caldav_accounts ca
      INNER JOIN carddav_address_books ab ON ab.caldav_account_id = ca.id
      WHERE
        ab.id = $1
        AND ca.user_id = $2
        AND ca.account_type = 'carddav'
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }

  public static async getByUrlAndUsername(
    username: string,
    url: string,
    userID: string,
    accountType: DAV_ACCOUNT_TYPE
  ): Promise<CalDavAccount | null> {
    const result: any = await getRepository(CalDavAccountEntity).query(
      `
      SELECT 
        id
      FROM 
        caldav_accounts
      WHERE
        user_id = $1
        AND url = $2
        AND username = $3
        AND account_type = $4
        AND deleted_at IS NULL;
    `,
      [userID, url, username, accountType]
    );

    return getOneResult(result);
  }

  public static async getByUserIDAndCalendarID(
    userID: string,
    calendarID: string
  ) {
    const calDavAccountsRaw: AccountRaw[] =
      await CalDavAccountRepository.getRepository().query(
        `
    SELECT 
        ca.id as id,
        ca.url as url,
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
        ca.principal_url as "principalUrl",
        cc.id as "calendarID",
        cc.data as "calendar",
        cc.color as "calendarColor",
        cc.last_update_at as "calendarLastUpdateAt"
    FROM 
        caldav_accounts ca
        LEFT JOIN caldav_calendars cc ON cc.caldav_account_id = ca.id 
    WHERE
        ca.deleted_at IS NULL
        AND cc.deleted_at IS NULL
        AND ca.user_id = $1
        AND cc.id = $2
  `,
        [userID, calendarID]
      );

    if (!calDavAccountsRaw[0]) {
      return null;
    }

    if (!calDavAccountsRaw[0].calendar || !calDavAccountsRaw[0].calendarID) {
      return null;
    }

    const result = {
      ...calDavAccountsRaw[0],
      calendar: {
        ...JSON.parse(calDavAccountsRaw[0].calendar),
        id: calDavAccountsRaw[0].calendarID,
        lastUpdateAt: calDavAccountsRaw[0].calendarLastUpdateAt,
        color: calDavAccountsRaw[0].calendarColor,
      },
    };

    return result;
  }

  public static async update(data: CalDavAccountEntity) {
    return getRepository(CalDavAccountEntity).update({ id: data.id }, data);
  }

  public static getCalDavAccountsForSync = async (
    userID?: string
  ): Promise<AccountWithCalendars[]> => {
    const parameters: any = userID ? [userID] : undefined;

    const calDavAccountsRaw: AccountRaw[] =
      await CalDavAccountRepository.getRepository().query(
        `
    SELECT 
        ca.id as id,
        ca.url as url,
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
        ca.principal_url as "principalUrl",
        cc.id as "calendarID",
        cc.data as "calendar",
        cc.url as "calendarUrl",
        cc.color as "calendarColor",
        cc.ctag_tasks as "ctagTasks",
        cc.last_update_at as "calendarLastUpdateAt"
    FROM 
        caldav_accounts ca
        LEFT JOIN caldav_calendars cc ON cc.caldav_account_id = ca.id 
    WHERE
        ca.deleted_at IS NULL
        AND cc.deleted_at IS NULL
        AND ca.account_type = 'caldav'
        ${userID ? 'AND ca.user_id = $1' : ''}
        AND (cc.last_update_at IS NULL OR now() >= cc.last_update_at) 
  `,
        parameters
      );
    //         AND (cc.last_update_at IS NULL OR now() - 10 * interval '1 minutes' >= cc.last_update_at)

    // map result
    const calDavAccounts: any = [];

    const groupedCalDavAccounts = groupBy(calDavAccountsRaw, 'id');

    forEach(groupedCalDavAccounts, (items: AccountRaw[]) => {
      const calendars: any = [];

      forEach(items, (item) => {
        if (item.calendar) {
          calendars.push({
            ...JSON.parse(item.calendar),
            id: item.calendarID,
            lastUpdateAt: item.calendarLastUpdateAt,
            color: item.calendarColor,
            url: item.calendarUrl,
            ctagTasks: item.ctagTasks,
          });
        }
      });

      calDavAccounts.push({
        ...items[0],
        calendars,
      });
    });

    return calDavAccounts;
  };

  public static getCalDavAccounts = async (
    userID?: string,
    skipHiddenCalendars?: boolean
  ) => {
    const parameters: any = userID ? [userID] : undefined;

    const calDavAccountsRaw: AccountRaw[] =
      await CalDavAccountRepository.getRepository().query(
        `
    SELECT 
        ca.id as id,
        ca.url as url,
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
        ca.principal_url as "principalUrl",
        cc.id as "calendarID",
        cc.color as "calendarColor",
        cc.data as "calendar"
    FROM 
        caldav_accounts ca
        LEFT JOIN caldav_calendars cc ON cc.caldav_account_id = ca.id 
    WHERE
        ca.deleted_at IS NULL
        AND cc.deleted_at IS NULL
        AND ca.account_type = 'caldav'
        ${userID ? 'AND ca.user_id = $1' : ''}
        ${skipHiddenCalendars ? 'AND cc.is_hidden IS FALSE' : ''}
  `,
        parameters
      );

    // map result
    const calDavAccounts: any = [];

    const groupedCalDavAccounts = groupBy(calDavAccountsRaw, 'id');

    forEach(groupedCalDavAccounts, (items: AccountRaw[]) => {
      const calendars: any = [];

      forEach(items, (item) => {
        if (item.calendar) {
          calendars.push({
            ...JSON.parse(item.calendar),
            id: item.calendarID,
            color: item.calendarColor,
          });
        }
      });

      calDavAccounts.push({
        ...items[0],
        calendars,
      });
    });

    return calDavAccounts;
  };

  public static getCardDavAccounts = async (
    userID?: string,
    addressBookID?: string
  ): Promise<CardDavAccountWithAddressBooks[]> => {
    const parameters: any = userID ? [userID] : undefined;

    if (addressBookID) {
      parameters.push(addressBookID);
    }

    const calDavAccountsRaw: CardDavAccountRaw[] =
      await CalDavAccountRepository.getRepository().query(
        `
    SELECT 
        ca.id as id,
        ca.url as url,
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
        ca.principal_url as "principalUrl",
        ca.user_id as "userID",
        ca.data as "accountData",
        ab.data as "data",
        ab.id as "addressBookID",
        ab.url as "addressBookUrl",
        ab.last_update_at as "addressBookLastUpdateAt"
    FROM 
        caldav_accounts ca
        LEFT JOIN carddav_address_books ab ON ab.caldav_account_id = ca.id 
    WHERE
        ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL
        AND ca.account_type = 'carddav'
        ${userID ? 'AND ca.user_id = $1' : ''}
        ${addressBookID ? 'AND ab.id = $2' : ''}
        AND (ab.last_update_at IS NULL OR now() >= ab.last_update_at) 
  `,
        parameters
      );

    // map result
    const result: CardDavAccountWithAddressBooks[] = [];

    const groupedCalDavAccounts = groupBy(calDavAccountsRaw, 'id');

    forEach(groupedCalDavAccounts, (items: CardDavAccountRaw[]) => {
      const addressBooks: AddressBook[] = [];

      forEach(items, (item) => {
        if (item.addressBookID) {
          addressBooks.push({
            id: item.addressBookID,
            data: item.data,
            lastUpdateAt: item.addressBookLastUpdateAt,
            description: item.addressBookDescription,
            url: item.addressBookUrl,
          });
        }
      });

      const baseItem = items[0];

      result.push({
        id: baseItem.id,
        url: baseItem.url,
        data: baseItem.accountData,
        userID: baseItem.userID,
        username: baseItem.username,
        password: baseItem.password,
        principalUrl: baseItem.principalUrl,
        addressBooks,
      });
    });

    return result;
  };
}
