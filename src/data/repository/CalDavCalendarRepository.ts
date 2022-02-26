import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CalDavCalendarEntity from '../entity/CalDavCalendar';

export interface CalDavCalendarInterface {
  id: string;
  principalUrl: string;
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
        principal_url as "principalUrl"
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

  public static async update(data: CalDavCalendarEntity) {
    return getRepository(CalDavCalendarEntity).update({ id: data.id }, data);
  }
}
