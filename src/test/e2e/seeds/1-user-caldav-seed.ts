import { AdminCreateUserRequest } from '../../../bloben-interface/admin/admin';
import { CreateCalDavAccountRequest } from '../../../bloben-interface/calDavAccount/calDavAccount';
import { DAV_ACCOUNT_TYPE } from '../../../bloben-interface/enums';
import { USER_ROLE } from '../../../api/app/auth/UserEnums';
import { generateRandomSimpleString } from '../../../utils/common';
import { v4 } from 'uuid';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalendarSettingsEntity from '../../../data/entity/CalendarSettings';
import CalendarSettingsRepository from '../../../data/repository/CalendarSettingsRepository';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

export const TEST_USER_PASSWORD = 'asivi2xxco59af';

export const testUserCalDavData: AdminCreateUserRequest = {
  username: 'test_user_caldav',
  password: TEST_USER_PASSWORD,
};

export const CALDAV_TEST_ACCOUNT: CreateCalDavAccountRequest = {
  username: 'tester',
  password: 'tester',
  url: 'http://localhost:6080/dav.php',
  accountType: DAV_ACCOUNT_TYPE.CALDAV,
};

export const testDemoUserCalDavData: AdminCreateUserRequest = {
  username: 'demo_user_caldav',
  password: TEST_USER_PASSWORD,
};

const createUserWithCaldav = async (
  customData?: any
): Promise<{
  user: UserEntity;
  calDavAccount: CalDavAccountEntity;
}> => {
  const defaultData: AdminCreateUserRequest = {
    username: generateRandomSimpleString(30),
    password: TEST_USER_PASSWORD,
  };

  const newUser: UserEntity = new UserEntity(defaultData);

  // hash user password
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  newUser.id = v4();
  newUser.username = defaultData.username;
  newUser.hash = await bcrypt.hashSync(TEST_USER_PASSWORD, salt);

  const repository = UserRepository.getRepository();
  await repository.save(newUser);

  const calendarSettings = new CalendarSettingsEntity();
  calendarSettings.user = newUser;

  await CalendarSettingsRepository.getRepository().save(calendarSettings);

  await repository.update(newUser.id, {
    isEnabled: true,
    ...customData,
  });

  const calDavAccount = new CalDavAccountEntity(
    {
      password: CALDAV_TEST_ACCOUNT.password,
      url: CALDAV_TEST_ACCOUNT.url,
      username: CALDAV_TEST_ACCOUNT.username,
      accountType: DAV_ACCOUNT_TYPE.CALDAV,
    },
    newUser
  );
  calDavAccount.principalUrl =
    'http://localhost:6080/dav.php/principals/tester/';
  calDavAccount.accountType = DAV_ACCOUNT_TYPE.CALDAV;

  await CalDavAccountRepository.create(calDavAccount);

  return { user: newUser, calDavAccount };
};

const createUserOnlyCalDavSeed = async (
  customData: any
): Promise<{
  user: UserEntity;
}> => {
  const defaultData: AdminCreateUserRequest = {
    username: generateRandomSimpleString(30),
    password: TEST_USER_PASSWORD,
  };

  const newUser: UserEntity = new UserEntity(defaultData);

  // hash user password
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  newUser.id = v4();
  newUser.username = defaultData.username;
  newUser.hash = await bcrypt.hashSync(TEST_USER_PASSWORD, salt);

  const repository = UserRepository.getRepository();
  await repository.save(newUser);

  const calendarSettings = new CalendarSettingsEntity();
  calendarSettings.user = newUser;

  await CalendarSettingsRepository.getRepository().save(calendarSettings);

  await repository.update(newUser.id, {
    isEnabled: true,
    ...customData,
  });

  return { user: newUser };
};

export const seedUsersE2E = async (data?: any) => {
  const user = await createUserWithCaldav(data);
  const demoUser = await createUserWithCaldav({ role: USER_ROLE.DEMO });

  return {
    userData: user,
    demoUserData: demoUser,
  };
};

export const seedUserOnlyCalDavSeedE2E = async (data?: any) => {
  const user = await createUserOnlyCalDavSeed(data);
  const demoUser = await createUserOnlyCalDavSeed({ role: USER_ROLE.DEMO });

  return {
    userData: user,
    demoUserData: demoUser,
  };
};
