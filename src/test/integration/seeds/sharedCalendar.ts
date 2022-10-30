import { Connection, getConnection } from 'typeorm';

import { DateTime } from 'luxon';
import { PostSharedLinkRequest } from 'bloben-interface';
import { seedCalDavCalendars } from './calDavCalendars';
import SharedLinkCalendarEntity from '../../../data/entity/SharedLinkCalendars';
import SharedLinkEntity from '../../../data/entity/SharedLink';
import UserEntity from '../../../data/entity/UserEntity';

export const sharedCalendarTestData: PostSharedLinkRequest = {
  name: 'Shared calendar',
  calDavCalendars: [],
  webcalCalendars: [],
  expireAt: null,
  password: null,
  settings: {},
};

export const createSharedCalendarTestData = async (userID: string) => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const { calDavCalendar } = await seedCalDavCalendars(userID);

  const sharedLink = new SharedLinkEntity(sharedCalendarTestData, user);

  await connection.manager.save(sharedLink);

  const sharedLinkCalendar = new SharedLinkCalendarEntity(
    sharedLink,
    calDavCalendar.id
  );

  await connection.manager.save(sharedLinkCalendar);

  return sharedLink;
};

export const createSharedCalendarDisabledTestData = async (userID: string) => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const { calDavCalendar } = await seedCalDavCalendars(userID);

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

export const createSharedCalendarExpiredTestData = async (userID: string) => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const { calDavCalendar } = await seedCalDavCalendars(userID);

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

export const seedSharedCalendar = async (
  userID: string
): Promise<{
  sharedLink: SharedLinkEntity;
  sharedLinkExpired: SharedLinkEntity;
  sharedLinkDisabled: SharedLinkEntity;
}> => {
  return {
    sharedLink: await createSharedCalendarTestData(userID),
    sharedLinkExpired: await createSharedCalendarExpiredTestData(userID),
    sharedLinkDisabled: await createSharedCalendarDisabledTestData(userID),
  };
};
