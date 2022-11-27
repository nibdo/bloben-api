import { EntityRepository, Repository, getRepository } from 'typeorm';

import { DAVCalendar } from 'tsdav';
import { DAV_ACCOUNT_TYPE } from '../types/enums';
import { forEach, groupBy } from 'lodash';
import { getOneResult } from '../../utils/common';
import CalDavAccountEntity from '../entity/CalDavAccount';

interface CardDavAccountRaw {
  id: string;
  userID: string;
  accountType: string;
  username: string;
  password: string;
  rootUrl: string;
  homeUrl: string;
  serverUrl: string;
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
  accountType: string;
  rootUrl: string;
  homeUrl: string;
  serverUrl: string;
  principalUrl: string;
  data: any;
  username: string;
  password: string;
  addressBooks: AddressBook[];
}

export interface CalDavAccount {
  id: string;
  accountType: any;
  rootUrl: string;
  homeUrl: string;
  serverUrl: string;
  principalUrl: string;
  username: string;
  password: string;
}

export interface CalendarFromAccount extends DAVCalendar {
  ctagTasks?: string | null;
  id: string;
  lastUpdateAt: string;
  color: string;
  rootUrl: string;
  homeUrl: string;
  serverUrl: string;
  principalUrl: string;
}

interface BaseAccount {
  id: string;
  accountType: any;
  rootUrl: string;
  homeUrl: string;
  serverUrl: string;
  principalUrl: string;
  userID: string;
  username: string;
  password: string;
  calendarID: string;
  calendarColor: string;
  calendarUrl: string;
  calendarLastUpdateAt?: string;
  ctagTasks?: string | null;
}
export interface AccountRaw extends BaseAccount {
  calendar: string;
}

export interface CalendarFromAccount {
  id: string;
  lastUpdateAt: string;
  color: string | undefined;
  url: string;
  [key: string]: any;
}

export interface CalDavAccountItem extends BaseAccount {
  calendar: CalendarFromAccount;
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
        server_url as "serverUrl",
        home_url as "homeUrl",
        principal_url as "principalUrl",
        root_url as "rootUrl",
        account_type as "accountType",
        username,
        password
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
        server_url as "serverUrl",
        home_url as "homeUrl",
        principal_url as "principalUrl",
        root_url as "rootUrl",
        account_type as "accountType",
        username,
        password
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
        username,
        password,
        account_type as "accountType",
        server_url as "serverUrl",
        home_url as "homeUrl",
        principal_url as "principalUrl",
        root_url as "rootUrl"
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
        server_url as "serverUrl",
        home_url as "homeUrl",
        principal_url as "principalUrl",
        root_url as "rootUrl",
        account_type as "accountType",
        ca.username as username,
        ca.password as password
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
    serverUrl: string,
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
        AND server_url = $2
        AND username = $3
        AND account_type = $4
        AND deleted_at IS NULL;
    `,
      [userID, serverUrl, username, accountType]
    );

    return getOneResult(result);
  }

  public static async getByUserIDAndCalendarID(
    userID: string,
    calendarID: string
  ): Promise<CalDavAccountItem> {
    const calDavAccountsRaw: AccountRaw[] =
      await CalDavAccountRepository.getRepository().query(
        `
    SELECT 
        ca.id as id,
        ca.account_type as "accountType",
        ca.server_url as "serverUrl",
        ca.home_url as "homeUrl",
        ca.principal_url as "principalUrl",
        ca.root_url as "rootUrl",
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
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

    return {
      ...calDavAccountsRaw[0],
      calendar: {
        ...JSON.parse(calDavAccountsRaw[0].calendar),
        id: calDavAccountsRaw[0].calendarID,
        lastUpdateAt: calDavAccountsRaw[0].calendarLastUpdateAt,
        color: calDavAccountsRaw[0].calendarColor,
      },
    };
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
        ca.account_type as "accountType",
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
        ca.server_url as "serverUrl",
        ca.home_url as "homeUrl",
        ca.principal_url as "principalUrl",
        ca.root_url as "rootUrl",
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
        ca.account_type as "accountType",
        ca.server_url as "serverUrl",
        ca.home_url as "homeUrl",
        ca.principal_url as "principalUrl",
        ca.root_url as "rootUrl",
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
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
        ca.account_type as "accountType",
        ca.user_id as "userID",
        ca.username as username,
        ca.password as password,
        ca.server_url as "serverUrl",
        ca.home_url as "homeUrl",
        ca.principal_url as "principalUrl",
        ca.root_url as "rootUrl",
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
        serverUrl: baseItem.addressBookUrl,
        accountType: baseItem.accountType,
        homeUrl: baseItem.homeUrl,
        rootUrl: baseItem.rootUrl,
        principalUrl: baseItem.principalUrl,
        data: baseItem.accountData,
        userID: baseItem.userID,
        username: baseItem.username,
        password: baseItem.password,
        addressBooks,
      });
    });

    return result;
  };
}
