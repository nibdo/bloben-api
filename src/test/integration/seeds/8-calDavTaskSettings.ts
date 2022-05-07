import { Connection, MigrationInterface, getConnection } from 'typeorm';

import { testUserData } from './1-user-seed';
import UserEntity from '../../../data/entity/UserEntity';
import CalDavCalendarEntity from '../../../data/entity/CalDavCalendar';
import CalDavTaskSettingsEntity from '../../../data/entity/CalDavTaskSettings';

export class calDavTaskSettings implements MigrationInterface {
  public async up(): Promise<{ taskSettings: CalDavTaskSettingsEntity }> {
    const connection: Connection = await getConnection();

    const [user, calendar] = await Promise.all([
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
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
