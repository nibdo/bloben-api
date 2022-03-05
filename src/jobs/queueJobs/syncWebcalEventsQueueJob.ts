import { AxiosResponse } from 'axios';
import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { Job } from 'bullmq';
import { WEBCAL_FAILED_THRESHOLD } from '../../utils/constants';
import {
  deleteWebcalEventsExceptionsSql,
  deleteWebcalEventsSql,
} from '../../data/sql/deleteWebcalEvents';
import { getUserIDFromWsRoom } from '../../utils/common';
import { io } from '../../app';
import { webcalSyncBullQueue } from '../../service/BullQueue';
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

export const getWebcalendarsForSync = (data?: { userID: string }) => {
  return WebcalCalendarRepository.getRepository().query(
    `
            SELECT 
                wc.id as id, 
                wc.url as url, 
                wc.user_id as "userID",
                wc.attempt as "attempt",
                wc.updated_at as "updatedAt"
            FROM 
                webcal_calendars wc
            WHERE 
                (
                    (SELECT wc.attempt = 0 AND wc.last_sync_at IS NULL) OR
                    (wc.last_sync_at <= now() - wc.sync_frequency::int * interval '1 minutes') OR
                    (wc.attempt > 0 AND wc.updated_at <= now () - INTERVAL '${WEBCAL_FAILED_THRESHOLD}')
                )
                ${data?.userID ? `AND wc.user_id = '${data.userID}'` : ''}
                `
  );
};

export const syncWebcalEventsQueueJob = async (job?: Job) => {
  const data = job?.data;

  logger.info(`Checking webcal calendars for sync`, [
    LOG_TAG.QUEUE,
    LOG_TAG.WEBCAL,
  ]);
  try {
    const webcalCalendars: WebcalCalendar[] = await getWebcalendarsForSync(
      data
    );

    logger.info(`${webcalCalendars.length} webcal calendars to check`, [
      LOG_TAG.QUEUE,
      LOG_TAG.WEBCAL,
    ]);

    if (!webcalCalendars.length) {
      return;
    }

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
            `Checking webcal calendar with id: ${webcalCalendar.id}`,
            [LOG_TAG.QUEUE, LOG_TAG.WEBCAL]
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
            `Deleting previous records for webcal calendar ${webcalCalendar.id}`,
            [LOG_TAG.QUEUE, LOG_TAG.WEBCAL]
          );
          // delete previous records
          await queryRunner.manager.query(deleteWebcalEventsExceptionsSql, [
            webcalCalendar.id,
          ]);
          await queryRunner.manager.query(deleteWebcalEventsSql, [
            webcalCalendar.id,
          ]);
          logger.info(
            `Deleted previous records for webcal calendar ${webcalCalendar.id}`,
            [LOG_TAG.QUEUE, LOG_TAG.WEBCAL]
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
          ).emit(
            SOCKET_CHANNEL.SYNC,
            JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
          );

          logger.info('Webcal update job done', [
            LOG_TAG.QUEUE,
            LOG_TAG.WEBCAL,
          ]);
        } catch (e) {
          if (queryRunner) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
          }

          logger.error(
            `Error updating webcal calendar ${webcalCalendar.id} ${e.message}`,
            e,
            [LOG_TAG.QUEUE, LOG_TAG.WEBCAL]
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
          `Error fetching webcal calendar ${webcalCalendar.id} ${e.message}`,
          e,
          [LOG_TAG.QUEUE, LOG_TAG.WEBCAL]
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
    logger.error(`Error checking webcal calendars`, e, [
      LOG_TAG.QUEUE,
      LOG_TAG.WEBCAL,
    ]);
  }
};

export const webcalSyncQueueSocketJob = async () => {
  try {
    logger.info('webcalSyncQueueSocketJob start', [
      LOG_TAG.CRON,
      LOG_TAG.WEBCAL,
    ]);

    const socketClients = io.sockets.adapter.rooms;

    const activeUserIDs: string[] = [];

    socketClients.forEach((_set, room) => {
      const userID = getUserIDFromWsRoom(room);

      activeUserIDs.push(userID);
    });

    // schedule sync job for each user
    for (const userID of activeUserIDs) {
      await webcalSyncBullQueue.add(BULL_QUEUE.WEBCAL_SYNC, { userID: userID });
    }
  } catch (e) {
    logger.error(`Error checking webcal calendars`, e, [
      LOG_TAG.CRON,
      LOG_TAG.WEBCAL,
    ]);
  }
};
