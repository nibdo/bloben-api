import { AxiosResponse } from 'axios';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { Job } from 'bullmq';
import { SOCKET_CHANNEL, SOCKET_ROOM_NAMESPACE } from '../../utils/enums';
import {
  deleteWebcalEventsExceptionsSql,
  deleteWebcalEventsSql,
} from '../../data/sql/deleteWebcalEvents';
import { io } from '../../app';
import AxiosService from '../../service/AxiosService';
import ICalParser, { ICalJSON } from 'ical-js-parser-commonjs';
import WebcalCalendarEntity from '../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../data/repository/WebcalCalendarRepository';
import WebcalEventEntity from '../../data/entity/WebcalEventEntity';
import WebcalEventExceptionEntity from '../../data/entity/WebcalEventExceptionEntity';
import logger from '../../utils/logger';

interface WebcalCalendar {
  id: string;
  url: string;
  userID: string;
  updatedAt: string;
  attempt: number;
}

export const syncWebcalEventsQueueJob = async (job: Job) => {
  const { data } = job;

  logger.info(`[CRON]: Checking webcal calendars for sync`);
  try {
    const webcalCalendars: WebcalCalendar[] =
      await WebcalCalendarRepository.getRepository().query(
        `SELECT 
            wc.id as id, 
            wc.url as url, 
            wc.user_id as "userID",
            wc.attempt as "attempt",
            wc.updated_at as "updatedAt"
         FROM webcal_calendars wc
         WHERE 
            ((wc.attempt = 0 AND wc.last_sync_at IS NULL) OR 
            wc.last_sync_at <= now() - wc.sync_frequency::int * interval '1 minutes' OR
            (wc.attempt > 0 AND wc.updated_at <= now () - INTERVAL '4 HOURS'))
            ${data.userID ? `AND wc.user_id = '${data.userID}'` : ''}
         `
      );

    for (const webcalCalendar of webcalCalendars) {
      const webcalCalendarEntity: WebcalCalendarEntity =
        new WebcalCalendarEntity();
      webcalCalendarEntity.id = webcalCalendar.id;
      webcalCalendarEntity.attempt = webcalCalendar.attempt;

      try {
        let connection: Connection | null;
        let queryRunner: QueryRunner | null;
        try {
          logger.info(
            `[CRON]: Checking webcal calendar with id: ${webcalCalendar.id} `
          );

          // get file
          const response: AxiosResponse = await AxiosService.get(
            webcalCalendar.url
          );

          connection = await getConnection();
          queryRunner = await connection.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          // parse to JSON
          const parsedIcal: ICalJSON = ICalParser.toJSON(response.data);

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
              const newEvent: WebcalEventEntity =
                new WebcalEventEntity().setData(
                  event,
                  null,
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

          io.to(
            `${SOCKET_ROOM_NAMESPACE.USER_ID}${webcalCalendar.userID}`
          ).emit(SOCKET_CHANNEL.SYNC, JSON.stringify({ type: 'SYNC' }));

          logger.info('[CRON]: Webcal update job done  ');
        } catch (e) {
          if (queryRunner) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
          }

          logger.error(
            `[CRON]: Error updating webcal calendar ${webcalCalendar.id} ${
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
      } catch (e) {
        logger.error(
          `[CRON]: Error fetching webcal calendar ${webcalCalendar.id} ${
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
    logger.error(
      `[CRON]: Error checking webcal calendars: ${JSON.stringify(e)}`
    );
  }
};
