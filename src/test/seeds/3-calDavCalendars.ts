import { Connection, MigrationInterface, getConnection } from "typeorm";
import { forEach } from "lodash";

import { testUserData } from "./1-user-seed";
import UserEntity from "../../data/entity/UserEntity";
import { CreateCalDavAccountRequest } from "../../bloben-interface/calDavAccount/calDavAccount";
import CalDavAccountEntity from "../../data/entity/CalDavAccount";
import CalDavCalendarEntity from "../../data/entity/CalDavCalendar";

export const testAccountsData: CreateCalDavAccountRequest[] = [
  {
    username: "username1",
    password: "aaabbbb",
    url: "http://localhost:1000",
  },
  {
    username: "username2",
    password: "aaabbbb",
    url: "http://localhost:2000",
  },
];

export class calDavCalendars implements MigrationInterface {
  public async up(): Promise<{
    calDavAccount: CalDavAccountEntity;
    calDavCalendar: CalDavCalendarEntity;
  }> {
    // @ts-ignore
    const connection: Connection = await getConnection();

    const user: UserEntity | undefined = await connection.manager.findOne(
      UserEntity,
      {
        where: {
          username: testUserData.username,
        },
      }
    );

    const calDavAccounts: CalDavAccountEntity[] = [];
    const calDavCalendars: CalDavCalendarEntity[] = [];

    forEach(testAccountsData, (account) => {
      const newAccount = new CalDavAccountEntity(account, user);
      const newCalendar = new CalDavCalendarEntity();
      newAccount.principalUrl = `http://${testUserData.username}`;
      newAccount.url = `http://${testUserData.username}`;

      newCalendar.url = `http://${testUserData.username}`;
      newCalendar.calDavAccount = newAccount;
      newCalendar.displayName = "default";
      newCalendar.data = JSON.stringify({displayName: "default"});

      calDavAccounts.push(newAccount);
      calDavCalendars.push(newCalendar);
    });

    await connection.manager.save(calDavAccounts);
    await connection.manager.save(calDavCalendars);

    return {
      calDavAccount: calDavAccounts[0],
      calDavCalendar: calDavCalendars[0],
    };
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
