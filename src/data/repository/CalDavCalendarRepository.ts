import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CalDavCalendarEntity from '../entity/CalDavCalendar';

export interface CalDavCalendarInterface {
  id: string;
  url: string;
}

export interface CalDavCalendarWithAccountInterface {
  id: string;
  url: string;
  account: {
    id: string;
    username: string;
    password: string;
    rootUrl: string;
    homeUrl: string;
    serverUrl: string;
    principalUrl: string;
  };
}

@EntityRepository(CalDavCalendarEntity)
export default class CalDavCalendarRepository extends Repository<CalDavCalendarEntity> {
  public static getRepository() {
    return getRepository(CalDavCalendarEntity);
  }

  public static async create(data: CalDavCalendarEntity) {
    return getRepository(CalDavCalendarEntity).save(data);
  }

  public static async getByID(
    id: string,
    userID: string
  ): Promise<CalDavCalendarInterface | null> {
    const result: any = await getRepository(CalDavCalendarEntity).query(
      `
      SELECT 
        c.id as id,
        c.url as "url"
      FROM 
        caldav_calendars c
      INNER JOIN caldav_accounts ca ON ca.id = c.caldav_account_id
      WHERE
        c.id = $1
        AND ca.user_id = $2
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }

  public static async getByIDAndComponent(
    id: string,
    userID: string,
    component: string
  ): Promise<CalDavCalendarInterface | null> {
    const result: any = await getRepository(CalDavCalendarEntity).query(
      `
      SELECT 
        cc.id as id,
        cc.url as "url"
      FROM 
        caldav_calendars cc
      INNER JOIN 
        caldav_accounts ca ON cc.caldav_account_id = ca.id
      WHERE
        cc.id = $1
        AND ca.user_id = $2
        AND cc.components LIKE $3
        AND ca.deleted_at IS NULL
        AND cc.deleted_at IS NULL;
    `,
      [id, userID, `%${component}%`]
    );

    return getOneResult(result);
  }

  public static async getByIDWithAccount(
    id: string,
    userID: string
  ): Promise<CalDavCalendarWithAccountInterface | null> {
    const result: any = await getRepository(CalDavCalendarEntity).query(
      `
      SELECT 
        cc.id as id,
        cc.url as "url",
        ca.id as "accountID",
        ca.username as "accountUsername",
        ca.password as "accountPassword",
        ca.server_url as "serverUrl",
        ca.home_url as "homeUrl",
        ca.principal_url as "principalUrl",
        ca.root_url as "rootUrl"
      FROM 
        caldav_calendars cc
      INNER JOIN caldav_accounts ca on ca.id = cc.caldav_account_id
      WHERE
        cc.id = $1
        AND ca.user_id = $2
        AND cc.deleted_at IS NULL
        AND ca.deleted_at IS NULL;
    `,
      [id, userID]
    );

    const oneResult = getOneResult(result);

    if (oneResult) {
      return {
        id: oneResult.id,
        url: oneResult.url,
        account: {
          id: oneResult.accountID,
          username: oneResult.accountUsername,
          password: oneResult.accountPassword,
          serverUrl: oneResult.serverUrl,
          rootUrl: oneResult.rootUrl,
          homeUrl: oneResult.homeUrl,
          principalUrl: oneResult.principalUrl,
        },
      };
    }

    return null;
  }

  public static async getByIDAndAccountID(
    id: string,
    accountID: string,
    userID: string
  ): Promise<{ id: string } | null> {
    const result: any = await getRepository(CalDavCalendarEntity).query(
      `
      SELECT 
        cc.id as id
      FROM 
        caldav_calendars cc
      INNER JOIN caldav_accounts ca on ca.id = cc.caldav_account_id
      WHERE
        cc.id = $1
        AND ca.user_id = $2
        AND ca.id = $3
        AND cc.deleted_at IS NULL
        AND ca.deleted_at IS NULL;
    `,
      [id, userID, accountID]
    );

    return getOneResult(result);
  }

  public static async update(data: CalDavCalendarEntity) {
    return getRepository(CalDavCalendarEntity).update({ id: data.id }, data);
  }
}
