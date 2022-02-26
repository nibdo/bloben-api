import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  deleteWebcalEventsExceptionsSql,
  deleteWebcalEventsSql,
} from '../data/sql/deleteWebcalEvents';
import ICalParser, { ICalJSON } from 'ical-js-parser-commonjs';
import WebcalCalendarEntity from '../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../data/repository/WebcalCalendarRepository';
import WebcalEventEntity from '../data/entity/WebcalEventEntity';
import WebcalEventExceptionEntity from '../data/entity/WebcalEventExceptionEntity';
import axios, { AxiosResponse } from 'axios';
import logger from '../utils/logger';

interface WebcalCalendar {
  id: string;
  url: string;
  userID: string;
  updatedAt: string;
  attempt: number;
  defaultTimezone: string;
}

// interface ExternalEvent {
//   id: string;
//   updatedAt: Date;
//   externalID: string;
// }

// TODO handle large files
// TODO optimize due to long running operation
export const getWebcalEventsJob = async () => {
  logger.info(`[CRON]: Checking webcal calendars for sync`);
  try {
    const webcalCalendars: WebcalCalendar[] =
      await WebcalCalendarRepository.getRepository().query(
        `SELECT 
            wc.id as id, 
            wc.url as url, 
            wc.user_id as "userID",
            wc.attempt as "attempt",
            wc.updated_at as "updatedAt",
            cs.default_timezone as "defaultTimezone"
         FROM webcal_calendars wc
         LEFT JOIN calendar_settings cs ON wc.user_id = wc.user_id
         WHERE 
            (wc.attempt = 0 AND wc.last_sync_at IS NULL) OR 
            wc.last_sync_at <= now() - wc.sync_frequency::int * interval '1 minutes' OR
            (wc.attempt > 0 AND wc.updated_at <= now () - INTERVAL '4 HOURS')
         `
      );

    for (const webcalCalendar of webcalCalendars) {
      const webcalCalendarEntity: WebcalCalendarEntity =
        new WebcalCalendarEntity();
      webcalCalendarEntity.id = webcalCalendar.id;
      webcalCalendarEntity.attempt = webcalCalendar.attempt;

      let connection: Connection | null;
      let queryRunner: QueryRunner | null;
      try {
        logger.info(
          `[CRON]: Checking webcal calendar with id: ${webcalCalendar.id} `
        );

        // get file
        const response: AxiosResponse = await axios.get(webcalCalendar.url, {
          timeout: 20000,
        });

        // parse to JSON
        const parsedIcal: ICalJSON = ICalParser.toJSON(response.data);

        connection = await getConnection();
        queryRunner = await connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        logger.info(
          `[CRON]: Deleting previous records for webcal calendar ${webcalCalendar.id}`
        );
        // delete previous records
        await queryRunner.manager.query(deleteWebcalEventsExceptionsSql, [
          webcalCalendar.id,
        ]);
        await queryRunner.manager.query(deleteWebcalEventsSql, [
          webcalCalendar.id,
        ]);
        logger.info(
          `[CRON]: Deleted previous records for webcal calendar ${webcalCalendar.id}`
        );

        // recreate records
        if (parsedIcal.events && parsedIcal.events.length > 0) {
          for (const event of parsedIcal.events) {
            // handle exceptions for recurring event
            if (event.recurrenceId) {
              const eventException: WebcalEventExceptionEntity =
                new WebcalEventExceptionEntity(
                  webcalCalendar.userID,
                  webcalCalendar.id,
                  event
                );
              await queryRunner.manager.save(eventException);
            }

            // create new event
            const newEvent: WebcalEventEntity = new WebcalEventEntity().setData(
              event,
              webcalCalendar.defaultTimezone,
              webcalCalendarEntity
            );
            await queryRunner.manager.save(newEvent);
          }
        }

        webcalCalendarEntity.onSuccess();

        await queryRunner.manager.update(
          WebcalCalendarEntity,
          { id: webcalCalendar.id },
          {
            attempt: webcalCalendarEntity.attempt,
            lastSyncAt: webcalCalendarEntity.lastSyncAt,
          }
        );

        await queryRunner.commitTransaction();
        await queryRunner.release();
        logger.info('[CRON]: Webcal update job done  ');
      } catch (e) {
        if (queryRunner !== null) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
        }

        logger.error(
          `[CRON]: Error checking webcal calendar ${webcalCalendar.id} ${
            e.message
          } ${JSON.stringify(e)}`
        );

        webcalCalendarEntity.onFail();
        await WebcalCalendarRepository.getRepository().update(
          webcalCalendarEntity.id,
          {
            attempt: webcalCalendarEntity.attempt,
          }
        );
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    logger.error(
      `[CRON]: Error checking webcal calendars: ${JSON.stringify(e)}`
    );
  }
};
