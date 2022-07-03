import { Connection, getConnection } from 'typeorm';
import { DateTime } from 'luxon';
import { REMINDER_STATUS } from '../../data/entity/ReminderEntity';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import { formatInviteStartDate } from '../../utils/format';
import { io } from '../../app';
import ReminderRepository from '../../data/repository/ReminderRepository';
import logger from '../../utils/logger';

const formatReminderTime = (reminder: ReminderResult) => {
  if (reminder.amount === 0) {
    return 'starting now';
  } else {
    return `starting in ${reminder.amount} ${reminder.timeUnit}`;
  }
};
const formatEventTitle = (reminder: ReminderResult) => {
  return `Reminder: ${reminder.summary} ${formatReminderTime(reminder)}`;
};

const formatEventBody = (reminder: ReminderResult) => {
  return `${reminder.summary} @ ${formatInviteStartDate(
    DateTime.fromJSDate(reminder.sendAt)
      .plus({
        [reminder.timeUnit]: reminder.amount,
      })
      .toString(),
    reminder.timezone || reminder.defaultTimezone
  )}`;
};

interface ReminderResult {
  id: string;
  sendAt: Date;
  attempt: number;
  userID: string;
  summary: string;
  timezone: string;
  defaultTimezone: string;
  amount: number;
  timeUnit: string;
}

const handleCalDavReminders = async (connection: Connection) => {
  const reminders: ReminderResult[] = await connection.manager.query(
    `
      SELECT
        r.id as "id",
        r.send_at as "sendAt",
        r.attempt as "attempt",
        u.id as "userID",
        ce.summary as "summary",
        ce.timezone_start_at as "timezone",
        cs.timezone as "defaultTimezone",
        cea.amount as "amount",
        cea.time_unit as "timeUnit"
      FROM
        reminders r
      LEFT JOIN users u ON r.user_id = u.id
      INNER JOIN caldav_event_alarms cea on r.caldav_event_alarm_id = cea.id
      INNER JOIN caldav_events ce on cea.event_id = ce.id
      INNER JOIN calendar_settings cs ON cs.user_id = u.id
      WHERE
        "r"."was_fired" = false
        AND r.attempt < 5
        AND r.send_at <= now()
        AND r.send_at + INTERVAL '10 MINUTES' >= now()
        AND u.deleted_at IS NULL`
  );

  for (const item of reminders) {
    try {
      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${item.userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({
          type: SOCKET_MSG_TYPE.NOTIFICATIONS,
          title: formatEventTitle(item),
          body: formatEventBody(item),
        })
      );

      await ReminderRepository.getRepository().update(
        {
          id: item.id,
        },
        {
          wasFired: true,
          attempt: item.attempt + 1,
          status: REMINDER_STATUS.SUCCESS,
        }
      );
    } catch (e) {
      await ReminderRepository.getRepository().update(
        {
          id: item.id,
        },
        {
          status: REMINDER_STATUS.FAILED,
          attempt: item.attempt + 1,
        }
      );
    }
  }
};

const handleWebcalReminders = async (connection: Connection) => {
  const reminders: ReminderResult[] = await connection.manager.query(
    `
      SELECT
        r.id as "id",
        r.send_at as "sendAt",
        r.attempt as "attempt",
        u.id as "userID",
        we.summary as "summary",
        we.timezone_start_at as "timezone",
        cs.timezone as "defaultTimezone"
      FROM
        reminders r
      LEFT JOIN users u ON r.user_id = u.id
      INNER JOIN webcal_events we on r.webcal_event_id = we.id
      INNER JOIN calendar_settings cs ON cs.user_id = u.id
      WHERE
        "r"."was_fired" = false
        AND r.attempt < 5
        AND r.send_at <= now()
        AND r.send_at + INTERVAL '10 MINUTES' >= now()
        AND u.deleted_at IS NULL`
  );

  for (const item of reminders) {
    try {
      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${item.userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({
          type: SOCKET_MSG_TYPE.NOTIFICATIONS,
          title: formatEventTitle(item),
          body: formatEventBody(item),
        })
      );

      await ReminderRepository.getRepository().update(
        {
          id: item.id,
        },
        {
          wasFired: true,
          attempt: item.attempt + 1,
          status: REMINDER_STATUS.SUCCESS,
        }
      );
    } catch (e) {
      await ReminderRepository.getRepository().update(
        {
          id: item.id,
        },
        {
          status: REMINDER_STATUS.FAILED,
          attempt: item.attempt + 1,
        }
      );
    }
  }
};

export const sendNotification = async () => {
  try {
    const connection: Connection = await getConnection();

    await handleCalDavReminders(connection);

    await handleWebcalReminders(connection);
  } catch (e) {
    logger.error('[CRON]: Sending reminders error', e);
  }
};
