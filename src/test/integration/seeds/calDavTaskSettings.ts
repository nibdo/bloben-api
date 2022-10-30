import { Connection, getConnection } from 'typeorm';

import { testUserData } from './user-seed';
import CalDavCalendarEntity from '../../../data/entity/CalDavCalendar';
import CalDavTaskSettingsEntity from '../../../data/entity/CalDavTaskSettings';
import UserEntity from '../../../data/entity/UserEntity';

export const calDavTaskSettings = async (): Promise<{
  taskSettings: CalDavTaskSettingsEntity;
}> => {
  const connection: Connection = await getConnection();

  const [, calendar] = await Promise.all([
    connection.manager.findOne(UserEntity, {
      where: {
        username: testUserData.username,
      },
    }),
    connection.manager.findOne(CalDavCalendarEntity, {
      where: {
        url: `http://${testUserData.username}`,
      },
    }),
  ]);

  const settings = new CalDavTaskSettingsEntity();
  settings.calendar = calendar;

  await connection.manager.save(settings);

  return { taskSettings: settings };
};
