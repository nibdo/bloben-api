import CalDavEventEntity from '../../data/entity/CalDavEventEntity';
import CalDavEventAlarmEntity from '../../data/entity/CalDavEventAlarmEntity';
import ReminderEntity from '../../data/entity/ReminderEntity';
import { getConnection } from 'typeorm';
import UserEntity from '../../data/entity/UserEntity';

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
    id,
  });
};
