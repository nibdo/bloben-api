import { MigrationInterface } from 'typeorm';

import UserRepository from '../../../data/repository/UserRepository';
import {AdminCreateUserRequest} from "../../../bloben-interface/admin/admin";
import AdminUsersService from "../../../api/adminUsers/AdminUsersService";
import UserEntity from "../../../data/entity/UserEntity";
import {ROLE} from "../../../bloben-interface/enums";

export const TEST_USER_PASSWORD = 'asivi2xxco59af';

export const testUserData: AdminCreateUserRequest = {
  username: 'test_user',
  password: TEST_USER_PASSWORD,
};

export const testUserDataWebcal: AdminCreateUserRequest = {
  username: 'test_user_webcal',
  password: TEST_USER_PASSWORD,
};

export const testDemoUserData: AdminCreateUserRequest = {
  username: 'demo_user',
  password: TEST_USER_PASSWORD,
};

export const testUserDataWithTwoFactor: AdminCreateUserRequest = {
  username: 'testUserWithTwoFactor',
  password: TEST_USER_PASSWORD,
};

export const TWO_FACTOR_SECRET = 'IZLXCU2GJZIDWQTR';

export class userSeed implements MigrationInterface {
  public async up(): Promise<UserEntity> {
    // @ts-ignore
    await AdminUsersService.adminCreateUser({
      body: testUserData,
      // @ts-ignore
      session: {}
    });
    await AdminUsersService.adminCreateUser({
      body: testDemoUserData,
      // @ts-ignore
      session: {}
    });
    await AdminUsersService.adminCreateUser({
      body: testUserDataWithTwoFactor,
      // @ts-ignore
      session: {}
    });

    const user = await UserRepository.findByUsername(testUserData.username);
    user.isEnabled = true;
    await UserRepository.update(user);

    const demoUser = await UserRepository.findByUsername(testDemoUserData.username);
    demoUser.isEnabled = true;
    demoUser.role = ROLE.DEMO
    await UserRepository.update(demoUser);

    const userWithTwoFactor = await UserRepository.findByUsername(
      testUserDataWithTwoFactor.username
    );

    userWithTwoFactor.twoFactorSecret = TWO_FACTOR_SECRET;
    userWithTwoFactor.isTwoFactorEnabled = true;
    userWithTwoFactor.isEnabled = true;

    await UserRepository.update(userWithTwoFactor);

    return user
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
