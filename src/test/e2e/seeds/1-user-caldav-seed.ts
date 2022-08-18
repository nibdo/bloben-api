import {MigrationInterface} from 'typeorm';

import UserRepository from '../../../data/repository/UserRepository';
import {AdminCreateUserRequest} from '../../../bloben-interface/admin/admin';
import AdminUsersService from '../../../api/adminUsers/AdminUsersService';
import UserEntity from '../../../data/entity/UserEntity';
import CalDavAccountRepository
  from '../../../data/repository/CalDavAccountRepository';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import {
  CreateCalDavAccountRequest
} from '../../../bloben-interface/calDavAccount/calDavAccount';
import {DAV_ACCOUNT_TYPE} from "../../../bloben-interface/enums";

export const TEST_USER_PASSWORD = 'asivi2xxco59af';

export const testUserCalDavData: AdminCreateUserRequest = {
  username: 'test_user_caldav',
  password: TEST_USER_PASSWORD,
};

export const CALDAV_TEST_ACCOUNT: CreateCalDavAccountRequest = {
  username: 'tester',
  password: 'tester',
  url: 'http://localhost:6080/dav.php',
  accountType: DAV_ACCOUNT_TYPE.CALDAV
};

export const testDemoUserCalDavData: AdminCreateUserRequest = {
  username: 'demo_user_caldav',
  password: TEST_USER_PASSWORD,
};

export class userCalDavSeed implements MigrationInterface {
  public async up(): Promise<{
    user: UserEntity;
    calDavAccount: CalDavAccountEntity;
  }> {
    // @ts-ignore
    await AdminUsersService.adminCreateUser({
      body: testUserCalDavData,
      // @ts-ignore
      session: {},
    });
    await AdminUsersService.adminCreateUser({
      body: testDemoUserCalDavData,
      // @ts-ignore
      session: {},
    });

    const user = await UserRepository.findByUsername(
      testUserCalDavData.username
    );
    user.isEnabled = true;
    await UserRepository.update(user);

    const calDavAccount = new CalDavAccountEntity(
      {
        password: CALDAV_TEST_ACCOUNT.password,
        url: CALDAV_TEST_ACCOUNT.url,
        username: CALDAV_TEST_ACCOUNT.username,
        accountType: DAV_ACCOUNT_TYPE.CALDAV
      },
      user
    );
    calDavAccount.principalUrl =
      'http://localhost:6080/dav.php/principals/tester/';
    calDavAccount.accountType = DAV_ACCOUNT_TYPE.CALDAV;

    await CalDavAccountRepository.create(calDavAccount);

    return { user, calDavAccount };
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}

export class userOnlyCalDavSeed implements MigrationInterface {
  public async up(): Promise<{
    user: UserEntity;
  }> {
    // @ts-ignore
    await AdminUsersService.adminCreateUser({
      body: testUserCalDavData,
      // @ts-ignore
      session: {},
    });
    await AdminUsersService.adminCreateUser({
      body: testDemoUserCalDavData,
      // @ts-ignore
      session: {},
    });

    const user = await UserRepository.findByUsername(
      testUserCalDavData.username
    );
    user.isEnabled = true;
    await UserRepository.update(user);

    return { user };
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
