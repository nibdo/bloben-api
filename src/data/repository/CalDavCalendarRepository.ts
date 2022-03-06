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
    url: string;
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
        id,
        url as "url"
      FROM 
        caldav_calendars
      WHERE
        id = $1
        AND user_id = $2
        AND deleted_at IS NULL;
    `,
      [id, userID]
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
        ca.url as "accountUrl"
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
          url: oneResult.accountUrl,
        },
      };
    }

    return null;
  }

  public static async update(data: CalDavCalendarEntity) {
    return getRepository(CalDavCalendarEntity).update({ id: data.id }, data);
  }
}
