import { QueryRunner, getConnection } from 'typeorm';

import { DateTime } from 'luxon';
import { LOG_TAG, TIMEZONE } from '../../utils/enums';
import { forEach, map } from 'lodash';
import { formatToRRule } from '../../utils/common';
import CalDavEventAlarmEntity from '../../data/entity/CalDavEventAlarmEntity';
import LuxonHelper from '../../utils/luxonHelper';
import RRule from 'rrule';
import ReminderEntity from '../../data/entity/ReminderEntity';
import logger from '../../utils/logger';

interface Alarms {
  eventAlarmID: string;
  amount: number;
  timeUnit: string;
  beforeStart: boolean;
  eventID: string;
  startAt: string;
  timezoneStartAt: string;
  rRule: string;
  userID: string;
  defaultTimezone: string;
}

export const calculateRepeatedReminders = async () => {
  const connection = await getConnection();
  let queryRunner: QueryRunner | null;

  logger.info('[CRON] Calculate repeated alarms', [LOG_TAG.CRON]);

  const alarms: Alarms[] = await connection.manager.query(
    `
      SELECT
        ce.id as "eventAlarmID",
        ce.amount as "amount",
        ce.time_unit as "timeUnit",
        ce.before_start as "beforeStart",
        e.id as "eventID",
        e.start_at as "startAt",
        e.timezone_start_at as "timezoneStartAt",
        e.r_rule as "rRule",
        ca.user_id as "userID",
        cs.timezone as "defaultTimezone"
      FROM caldav_event_alarms ce
      INNER JOIN caldav_events e on ce.event_id = e.id
      INNER JOIN caldav_calendars cc on e.caldav_calendar_id = cc.id
      INNER JOIN caldav_accounts ca on cc.caldav_account_id = ca.id
      INNER JOIN calendar_settings cs on ca.user_id = cs.user_id
      WHERE 
        e.is_repeated = TRUE
        AND cc.deleted_at IS NULL
        AND ca.deleted_at IS NULL`
  );

  if (!alarms.length) {
    return;
  }

  try {
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const eventAlarmIDs = map(alarms, 'eventAlarmID');

    // delete prev repeated reminders
    await queryRunner.manager.query(
      `
      DELETE
        from reminders r
      WHERE 
        r.caldav_event_alarm_id = ANY($1)
    `,
      [eventAlarmIDs]
    );

    const promises: any = [];

    for (const item of alarms) {
      const dateNow = DateTime.now();
      const dateTo = dateNow.plus({ weeks: 1 });

      const sendAt = LuxonHelper.subtractFromDate(
        new Date(item.startAt),
        item.timezoneStartAt || item.defaultTimezone,
        item.amount,
        item.timeUnit,
        item.timezoneStartAt === TIMEZONE.FLOATING
      );

      const rRuleString: string = formatToRRule(
        item.rRule,
        sendAt.toISOString()
      );

      const rRule = RRule.fromString(rRuleString);

      const rRuleResults: Date[] = rRule.between(
        new Date(Date.UTC(dateNow.year, dateNow.month - 1, dateNow.day, 0, 0)),
        new Date(
          Date.UTC(
            dateTo.year,
            dateTo.month - 1,
            dateTo.day,
            dateTo.hour,
            dateTo.minute
          )
        )
      );

      const eventAlarm = new CalDavEventAlarmEntity();
      eventAlarm.id = item.eventAlarmID;
      forEach(rRuleResults, (rRuleResult) => {
        const newReminder = new ReminderEntity(
          eventAlarm,
          rRuleResult.toISOString(),
          item.userID
        );
        promises.push(queryRunner.manager.save(newReminder));
      });

      await Promise.all(promises);
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();
  } catch (e) {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    logger.error('[CRON]: Calculate repeated reminders error', e);
  }
};
