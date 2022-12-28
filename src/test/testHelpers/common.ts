import { DateTime } from 'luxon';
import { createRepeatedTestCalDavEvent } from '../e2e/calDAV/calDavServerTestHelper';
import { createTestCalendarCalendar } from './calDavServerTestHelper';
import { getConnection } from 'typeorm';
import { seedUsersE2E } from '../e2e/seeds/user-caldav-seed';
import CalDavEventAlarmEntity from '../../data/entity/CalDavEventAlarmEntity';
import CalDavEventEntity from '../../data/entity/CalDavEventEntity';
import ReminderEntity from '../../data/entity/ReminderEntity';
import UserEntity from '../../data/entity/UserEntity';

export const invalidUUID = '460f1b3c-d781-45b3-9f2f-0008cf57c126';

export const createTestReminder = async (
  event: CalDavEventEntity,
  date: string,
  user: UserEntity,
  attempt?: number
) => {
  const connection = await getConnection();
  const alarm = new CalDavEventAlarmEntity();
  alarm.event = event;
  alarm.amount = 10;
  alarm.timeUnit = 'minutes';

  await connection.manager.save(CalDavEventAlarmEntity, alarm);

  const reminder = new ReminderEntity(alarm, date, user.id);

  if (attempt) {
    reminder.attempt = attempt;
  }

  await connection.manager.save(ReminderEntity, reminder);

  return reminder;
};

export const getTestReminder = async (id: string) => {
  const connection = await getConnection();

  return connection.manager.findOne(ReminderEntity, {
    where: { id },
  });
};

export const createE2EUserWithCalendars = async (withEvent?: boolean) => {
  const baseDateTime = DateTime.now()
    .set({
      hour: 14,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toUTC();

  const { userData } = await seedUsersE2E();
  const calDavCalendar = await createTestCalendarCalendar(
    userData.user.id,
    userData.calDavAccount
  );
  const calDavCalendar2 = await createTestCalendarCalendar(
    userData.user.id,
    userData.calDavAccount
  );

  let eventData;
  if (withEvent) {
    eventData = await createRepeatedTestCalDavEvent(
      userData.user.id,
      userData.calDavAccount,
      calDavCalendar.id,
      baseDateTime
    );
  }

  return {
    userID: userData.user.id,
    accountID: userData.calDavAccount,
    calendarID: calDavCalendar.id,
    calendarID2: calDavCalendar2.id,
    eventData,
  };
};
