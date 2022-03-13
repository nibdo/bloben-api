import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CalDavTaskEntity from '../entity/CalDavTaskEntity';

@EntityRepository(CalDavTaskEntity)
export default class CalDavTaskRepository extends Repository<CalDavTaskEntity> {
  public static getRepository() {
    return getRepository(CalDavTaskEntity);
  }

  public static async getByID(id: string, userID: string): Promise<any | null> {
    const result: any = await getRepository(CalDavTaskEntity).query(
      `
      SELECT 
        t.id
      FROM 
        caldav_tasks t
      INNER JOIN caldav_calendars c ON c.id = t.caldav_calendar_id
      INNER JOIN caldav_accounts a ON a.id = c.caldav_account_id
      WHERE
        t.id = $1
        AND a.user_id = $2
        AND t.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND a.deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }
}
