import { AxiosResponse } from 'axios';
import {
  BULL_QUEUE,
  GROUP_LOG_KEY,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { Job } from 'bullmq';
import {
  deleteWebcalEventsExceptionsSql,
  deleteWebcalEventsSql,
} from '../../data/sql/deleteWebcalEvents';
import { forEach } from 'lodash';
import { getUserIDFromWsRoom } from '../../utils/common';
import { io } from '../../app';
import { webcalSyncBullQueue } from '../../service/BullQueue';
import AxiosService from '../../service/AxiosService';
import ICalParser, { ICalJSON } from 'ical-js-parser';
import WebcalCalendarEntity from '../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../data/repository/WebcalCalendarRepository';
import WebcalEventEntity from '../../data/entity/WebcalEventEntity';
import WebcalEventExceptionEntity from '../../data/entity/WebcalEventExceptionEntity';
import logger, { groupLogs } from '../../utils/logger';

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
                    (wc.last_sync_at <= now() - wc.sync_frequency::int * interval '1 hours')
                )
                ${data?.userID ? `AND wc.user_id = '${data.userID}'` : ''}
                `
  );
};

export const syncWebcalEventsQueueJob = async (job?: Job) => {
  const data = job?.data;

  await groupLogs(
    GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
    `Checking webcal calendars for sync`
  );

  try {
    const webcalCalendars: WebcalCalendar[] = await getWebcalendarsForSync(
      data
    );

    await groupLogs(
      GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
      `${webcalCalendars.length} webcal calendars to check`
    );

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
          await groupLogs(
            GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
            `Checking webcal calendar with id: ${webcalCalendar.id}`
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

          if (parsedIcal.errors.length) {
            logger.warn(
              `Webcalendar errors ${JSON.stringify(parsedIcal.errors)}`,
              [LOG_TAG.CRON, LOG_TAG.WEBCAL]
            );
          }

          await groupLogs(
            GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
            `Deleting previous records for webcal calendar ${webcalCalendar.id}`
          );
          // delete previous records
          await queryRunner.manager.query(deleteWebcalEventsExceptionsSql, [
            webcalCalendar.id,
          ]);
          await queryRunner.manager.query(deleteWebcalEventsSql, [
            webcalCalendar.id,
          ]);

          await groupLogs(
            GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
            `Deleted previous records for webcal calendar ${webcalCalendar.id}`
          );

          // recreate records
          if (parsedIcal.events && parsedIcal.events.length > 0) {
            for (const event of parsedIcal.events) {
              try {
                // handle exceptions for recurring event
                if (event.recurrenceId) {
                  const eventException: WebcalEventExceptionEntity =
                    new WebcalEventExceptionEntity(
                      webcalCalendar.userID,
                      webcalCalendar.id,
                      event,
                      event.recurrenceId
                    );
                  await queryRunner.manager.save(eventException);
                }

                if (event.exdate?.length) {
                  const exceptionPromises: any = [];
                  forEach(event.exdate, (exDate) => {
                    const eventException: WebcalEventExceptionEntity =
                      new WebcalEventExceptionEntity(
                        webcalCalendar.userID,
                        webcalCalendar.id,
                        event,
                        exDate
                      );
                    exceptionPromises.push(
                      queryRunner.manager.save(eventException)
                    );
                  });

                  await Promise.all(exceptionPromises);
                }

                // create new event
                const newEvent: WebcalEventEntity =
                  new WebcalEventEntity().setData(
                    event,
                    null,
                    webcalCalendarEntity
                  );
                await queryRunner.manager.save(newEvent);
              } catch (e) {
                logger.error(
                  `Creating event from webcalendar error with event ${JSON.stringify(
                    event
                  )}`,
                  e,
                  [LOG_TAG.CRON, LOG_TAG.WEBCAL]
                );
              }
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

          await groupLogs(
            GROUP_LOG_KEY.WEBCAL_SYNC_JOB,
            `Webcal update job done for ${webcalCalendar.id}`
          );
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
    await groupLogs(
      GROUP_LOG_KEY.CALDAV_JOB_CONNECTED_USERS,
      'webcalSyncQueueSocketJob start'
    );

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
