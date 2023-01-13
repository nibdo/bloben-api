import { QueryRunner, getConnection } from 'typeorm';

import { CalendarAlarms } from 'bloben-interface';
import { DateTime } from 'luxon';
import { Job } from 'bullmq';
import { LOG_TAG, TIMEZONE } from '../../utils/enums';
import { createArrayQueryReplacement } from '../../utils/common';
import { getWebcalEvents } from '../../api/app/event/helpers/getWebCalEvents';
import { map } from 'lodash';
import CalendarSettingsRepository from '../../data/repository/CalendarSettingsRepository';
import LuxonHelper from '../../utils/luxonHelper';
import ReminderEntity from '../../data/entity/ReminderEntity';
import WebcalCalendarRepository from '../../data/repository/WebcalCalendarRepository';
import WebcalEventEntity from '../../data/entity/WebcalEventEntity';
import logger from '../../utils/logger';

interface WebcalCalendar {
  id: string;
  alarms: CalendarAlarms[];
  userID: string;
}

export const calculateWebcalAlarms = async (job: Job) => {
  const { data } = job;

  if (!data.webcalCalendarID) {
    return;
  }

  const webcalCalendarID = data.webcalCalendarID;

  const connection = await getConnection();
  let queryRunner: QueryRunner | null;

  logger.info(`[CRON] Calculate webcal alarms for id ${webcalCalendarID}`, [
    LOG_TAG.CRON,
  ]);

  const startOfDay = DateTime.now().startOf('day');
  const endOfNextDay = DateTime.now().plus({ day: 1 }).endOf('day');

  const webcalCalendars: WebcalCalendar[] =
    await WebcalCalendarRepository.getRepository().manager.query(
      `
      SELECT
        wc.id as id,
        wc.alarms as "alarms",
        wc.user_id as "userID"
      FROM webcal_calendars wc
      WHERE 
        wc.deleted_at IS NULL
        AND wc.id = $1
        AND wc.alarms IS NOT NULL
        `,
      [webcalCalendarID]
    );

  if (!webcalCalendars.length) {
    return;
  }

  const webcalCalendar = webcalCalendars[0];

  try {
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const idsToDelete = await queryRunner.manager.query(
      `
      SELECT 
        r.id as "id"
      FROM reminders r
      INNER JOIN webcal_events we ON we.id = r.webcal_event_id
      INNER JOIN webcal_calendars wc ON wc.id = we.external_calendar_id
      WHERE
        wc.id = $1
    `,
      [webcalCalendarID]
    );

    if (idsToDelete.length) {
      // delete prev reminders
      await queryRunner.manager.query(
        `
      DELETE
        FROM reminders r
      WHERE
        r.id IN (${createArrayQueryReplacement(map(idsToDelete, 'id'), 1)})
    `,
        [...map(idsToDelete, 'id')]
      );
    }

    const calendarSettings = await CalendarSettingsRepository.findByUserID(
      webcalCalendar.userID
    );

    const promises: any = [];

    // select events for next two days
    const webCalEvents = await getWebcalEvents(
      webcalCalendar.userID,
      startOfDay.toUTC().toString(),
      endOfNextDay.toUTC().toString(),
      false
    );

    for (const item of webCalEvents) {
      for (const alarm of webcalCalendar.alarms) {
        const sendAt = LuxonHelper.subtractFromDate(
          new Date(item.startAt),
          item.timezoneStartAt || calendarSettings.timezone,
          alarm.amount,
          alarm.timeUnit,
          item.timezoneStartAt === TIMEZONE.FLOATING
        );

        const webcalEventEntity = new WebcalEventEntity();
        webcalEventEntity.id = item.id;

        const newReminder = new ReminderEntity(
          undefined,
          sendAt.toISOString(),
          webcalCalendar.userID,
          webcalEventEntity
        );
        promises.push(queryRunner.manager.save(newReminder));
      }

      await Promise.all(promises);
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();
  } catch (e) {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    logger.error('[CRON]: Calculate webcal calendar reminders error', e);
  }
};
