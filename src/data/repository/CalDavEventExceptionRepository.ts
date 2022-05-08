import { EntityRepository, Repository, getRepository } from 'typeorm';

import CalDavEventEntity from '../entity/CalDavEventEntity';
import CalDavEventExceptionEntity from '../entity/CalDavEventExceptionEntity';

export interface CalDavEventExceptionsRaw {
  id: string;
  externalID: string;
  exceptionDate: Date;
  exceptionTimezone: string | null;
}

@EntityRepository(CalDavEventExceptionEntity)
export default class CalDavEventExceptionRepository extends Repository<CalDavEventExceptionEntity> {
  public static getRepository() {
    return getRepository(CalDavEventEntity);
  }

  public static getExceptions(
    userID: string,
    ids: string[]
  ): Promise<CalDavEventExceptionsRaw[]> {
    return getRepository(CalDavEventExceptionEntity).query(
      `
          SELECT
            cee.id as id,
            cee.external_id as "externalID",
            cee.exception_date as "exceptionDate",
            cee.exception_timezone as "exceptionTimezone"
          FROM
            caldav_event_exceptions cee
          WHERE 
            cee.user_id = $1
            AND cee.external_id = ANY($2)
        `,
      [userID, ids]
    );
  }
}
