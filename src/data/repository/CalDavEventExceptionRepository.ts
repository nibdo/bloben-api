import { EntityRepository, Repository, getRepository } from 'typeorm';

import { DateTime } from 'luxon';
import { DateTimeObject } from 'ical-js-parser';
import { getOneResult } from '../../utils/common';
import CalDavEventExceptionEntity from '../entity/CalDavEventExceptionEntity';

export interface CalDavEventExceptionsRaw {
  id: string;
  caldavEventID: string;
  externalID: string;
  exceptionDate: Date;
  exceptionTimezone: string | null;
}

@EntityRepository(CalDavEventExceptionEntity)
export default class CalDavEventExceptionRepository extends Repository<CalDavEventExceptionEntity> {
  public static getRepository() {
    return getRepository(CalDavEventExceptionEntity);
  }

  public static getExceptions(
    userID: string,
    ids: string[]
  ): Promise<CalDavEventExceptionsRaw[]> {
    return getRepository(CalDavEventExceptionEntity).query(
      `
          SELECT
            cee.id as id,
            cee.caldav_event_id as "caldavEventID",
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

  public static async getExceptionByEventIDAndDate(
    userID: string,
    caldavEventID: string,
    date: DateTimeObject
  ): Promise<CalDavEventExceptionsRaw> {
    const result = await getRepository(CalDavEventExceptionEntity).query(
      `
          SELECT
            cee.id as id,
            cee.caldav_event_id as "caldavEventID",
            cee.external_id as "externalID",
            cee.exception_date as "exceptionDate",
            cee.exception_timezone as "exceptionTimezone"
          FROM
            caldav_event_exceptions cee
          WHERE 
            cee.user_id = $1
            AND cee.caldav_event_id = $2
            AND cee.exception_date = $3
            AND cee.exception_timezone = $4
        `,
      [userID, caldavEventID, date.value, date.timezone || null]
    );

    return getOneResult(result);
  }

  public static async getExceptionByExternalEventIDAndDate(
    userID: string,
    externalEventID: string,
    date: DateTimeObject
  ): Promise<CalDavEventExceptionsRaw> {
    const exceptionDate: string | DateTime = date.timezone
      ? DateTime.fromISO(date.value, { zone: date.timezone }).toUTC().toString()
      : DateTime.fromISO(date.value).toString();

    const result = await getRepository(CalDavEventExceptionEntity).query(
      `
          SELECT
            cee.id as id,
            cee.caldav_event_id as "caldavEventID",
            cee.external_id as "externalID",
            cee.exception_date as "exceptionDate",
            cee.exception_timezone as "exceptionTimezone"
          FROM
            caldav_event_exceptions cee
          WHERE 
            cee.user_id = $1
            AND cee.external_id = $2
            AND cee.exception_date = $3
            AND cee.exception_timezone = $4
        `,
      [userID, externalEventID, exceptionDate, date.timezone || null]
    );

    return getOneResult(result);
  }

  public static async deleteExceptions(externalID: string, userID: string) {
    await CalDavEventExceptionRepository.getRepository().query(
      `
    DELETE FROM caldav_event_exceptions
     WHERE 
        external_id = $1
        AND user_id = $2
  `,
      [externalID, userID]
    );
  }
}
