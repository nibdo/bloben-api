import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CalDavTaskSettingsEntity from '../entity/CalDavTaskSettings';

@EntityRepository(CalDavTaskSettingsEntity)
export default class CalDavTaskSettingsRepository extends Repository<CalDavTaskSettingsEntity> {
  public static getRepository() {
    return getRepository(CalDavTaskSettingsEntity);
  }

  public static async getByCalendarID(calendarID: string, userID: string) {
    const raw = await CalDavTaskSettingsRepository.getRepository().query(
      `
      SELECT
        tl.id,
        tl."order"
      FROM 
        caldav_task_settings tl
      INNER JOIN caldav_calendars c ON c.id = tl.caldav_calendar_id
      INNER JOIN caldav_accounts ca ON ca.id = c.caldav_account_id
      WHERE 
        c.id = $1
        AND ca.user_id = $2
        AND tl.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL   
      `,
      [calendarID, userID]
    );

    const result = getOneResult(raw);

    return result;
  }
}
