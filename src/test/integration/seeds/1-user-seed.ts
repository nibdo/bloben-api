import { AdminCreateUserRequest } from '../../../bloben-interface/admin/admin';
import { USER_ROLE } from '../../../api/app/auth/UserEnums';
import { generateRandomSimpleString } from '../../../utils/common';
import { v4 } from 'uuid';
import CalendarSettingsEntity from '../../../data/entity/CalendarSettings';
import CalendarSettingsRepository from '../../../data/repository/CalendarSettingsRepository';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

export const TEST_USER_PASSWORD = 'asivi2xxco59af';

export const testUserData: AdminCreateUserRequest = {
  username: 'test_user',
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

export const seedUser = async (customData?: any): Promise<UserEntity> => {
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

  if (customData?.isTwoFactorEnabled) {
    newUser.isTwoFactorEnabled = customData.isTwoFactorEnabled;
  }
  if (customData?.twoFactorSecret) {
    newUser.twoFactorSecret = customData.twoFactorSecret;
  }

  const repository = UserRepository.getRepository();
  await repository.save(newUser);

  const calendarSettings = new CalendarSettingsEntity();
  calendarSettings.user = newUser;

  await CalendarSettingsRepository.getRepository().save(calendarSettings);

  await repository.update(newUser.id, {
    isEnabled: true,
    ...customData,
  });

  return newUser;
};

export const seedUsers = async (data?: any) => {
  const user = await seedUser(data);
  const demoUser = await seedUser({ role: USER_ROLE.DEMO });

  return [user.id, demoUser.id];
};

export const seedUserWithEntity = async (data?: any) => {
  const user = await seedUser(data);
  const demoUser = await seedUser({ role: USER_ROLE.DEMO });

  return { user, demoUser };
};
