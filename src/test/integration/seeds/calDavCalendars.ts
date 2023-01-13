import { Connection, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { CALDAV_COMPONENTS, DAV_ACCOUNT_TYPE } from '../../../data/types/enums';
import { CreateCalDavAccountRequest } from 'bloben-interface';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CalDavCalendarEntity from '../../../data/entity/CalDavCalendar';
import UserEntity from '../../../data/entity/UserEntity';

export const testAccountsData: CreateCalDavAccountRequest[] = [
  {
    username: 'username1',
    password: 'aaabbbb',
    url: 'http://localhost:1000',
    accountType: DAV_ACCOUNT_TYPE.CALDAV,
  },
  {
    username: 'username2',
    password: 'aaabbbb',
    url: 'http://localhost:2000',
    accountType: DAV_ACCOUNT_TYPE.CALDAV,
  },
];

export const seedCalDavCalendars = async (
  userID: string
): Promise<{
  calDavAccount: CalDavAccountEntity;
  calDavCalendar: CalDavCalendarEntity;
}> => {
  // @ts-ignore
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const calDavAccounts: CalDavAccountEntity[] = [];
  const calDavCalendars: CalDavCalendarEntity[] = [];

  forEach(testAccountsData, (account) => {
    const newAccount = new CalDavAccountEntity(account, user);
    const newCalendar = new CalDavCalendarEntity();
    newAccount.principalUrl = `http://${user.username}`;
    newAccount.serverUrl = `http://${user.username}`;
    newAccount.homeUrl = `http://${user.username}`;
    newAccount.rootUrl = `http://${user.username}`;
    newAccount.accountType = DAV_ACCOUNT_TYPE.CALDAV;

    newCalendar.url = `http://${user.username}`;
    newCalendar.calDavAccount = newAccount;
    newCalendar.displayName = 'default';
    newCalendar.data = JSON.stringify({ displayName: 'default' });
    newCalendar.components = JSON.stringify([
      CALDAV_COMPONENTS.VEVENT,
      CALDAV_COMPONENTS.VTODO,
    ]);

    calDavAccounts.push(newAccount);
    calDavCalendars.push(newCalendar);
  });

  await connection.manager.save(calDavAccounts);
  await connection.manager.save(calDavCalendars);

  return {
    calDavAccount: calDavAccounts[0],
    calDavCalendar: calDavCalendars[0],
  };
};
