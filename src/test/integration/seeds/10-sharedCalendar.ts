import {
  Connection,
  MigrationInterface,
  QueryRunner,
  getConnection,
} from 'typeorm';

import UserEntity from '../../../data/entity/UserEntity';
import { testUserData } from './1-user-seed';
import { PostSharedLinkRequest } from '../../../bloben-interface/calendar/shared/calendarShared';
import { calDavCalendars } from './3-calDavCalendars';
import SharedLinkEntity from '../../../data/entity/SharedLink';
import SharedLinkCalendarEntity from '../../../data/entity/SharedLinkCalendars';
import { DateTime } from 'luxon';

export const sharedCalendarTestData: PostSharedLinkRequest = {
  name: 'Shared calendar',
  calDavCalendars: [],
  webcalCalendars: [],
  expireAt: null,
  password: null,
  settings: {},
};

export const createSharedCalendarTestData = async () => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        username: testUserData.username,
      },
    }
  );

  const { calDavCalendar } = await new calDavCalendars().up();

  const sharedLink = new SharedLinkEntity(sharedCalendarTestData, user);

  await connection.manager.save(sharedLink);

  const sharedLinkCalendar = new SharedLinkCalendarEntity(
    sharedLink,
    calDavCalendar.id
  );

  await connection.manager.save(sharedLinkCalendar);

  return sharedLink;
};

export const createSharedCalendarDisabledTestData = async () => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        username: testUserData.username,
      },
    }
  );

  const { calDavCalendar } = await new calDavCalendars().up();

  const sharedLink = new SharedLinkEntity(sharedCalendarTestData, user);
  sharedLink.isEnabled = false;

  await connection.manager.save(sharedLink);

  const sharedLinkCalendar = new SharedLinkCalendarEntity(
    sharedLink,
    calDavCalendar.id
  );

  await connection.manager.save(sharedLinkCalendar);

  return sharedLink;
};

export const createSharedCalendarExpiredTestData = async () => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        username: testUserData.username,
      },
    }
  );

  const { calDavCalendar } = await new calDavCalendars().up();

  const sharedLink = new SharedLinkEntity(
    {
      ...sharedCalendarTestData,
      expireAt: DateTime.now().minus({ day: 1 }).toString(),
    },
    user
  );

  await connection.manager.save(sharedLink);

  const sharedLinkCalendar = new SharedLinkCalendarEntity(
    sharedLink,
    calDavCalendar.id
  );

  await connection.manager.save(sharedLinkCalendar);

  return sharedLink;
};

export class sharedCalendar implements MigrationInterface {
  public async up(): Promise<{
    sharedLink: SharedLinkEntity;
    sharedLinkExpired: SharedLinkEntity;
    sharedLinkDisabled: SharedLinkEntity;
  }> {
    return {
      sharedLink: await createSharedCalendarTestData(),
      sharedLinkExpired: await createSharedCalendarExpiredTestData(),
      sharedLinkDisabled: await createSharedCalendarDisabledTestData(),
    };
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
