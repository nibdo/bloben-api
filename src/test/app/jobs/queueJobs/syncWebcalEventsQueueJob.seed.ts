import AdminUsersService from '../../../../api/adminUsers/AdminUsersService';
import {
  testUserData,
  testUserDataWebcal,
  testUserDataWithTwoFactor,
} from '../../../seeds/1-user-seed';
import UserRepository from '../../../../data/repository/UserRepository';
import WebcalCalendarEntity from '../../../../data/entity/WebcalCalendarEntity';
import {
  WEBCAL_MOCK_URL_FAIL,
  WEBCAL_MOCK_URL_SUCCESS,
} from '../../../__mocks__/AxiosService';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';

export const createDummyWebcal = async (data: {
  attempt: number;
  lastSyncAt: Date | null;
  syncFrequency?: number;
  updatedAt?: Date | undefined;
}) => {
  await AdminUsersService.adminCreateUser({
    body: testUserDataWebcal,
    // @ts-ignore
    session: {},
  });

  const user = await UserRepository.findByUsername(testUserDataWebcal.username);

  const webcalCalendar = new WebcalCalendarEntity(
    {
      color: 'indigo',
      name: 'success',
      syncFrequency: data.syncFrequency,
      url: WEBCAL_MOCK_URL_SUCCESS,
      alarms: [],
    },
    user
  );

  webcalCalendar.attempt = data.attempt;
  if (data.updatedAt) {
    webcalCalendar.updatedAt = data.updatedAt;
  }
  webcalCalendar.lastSyncAt = data.lastSyncAt;

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  return { user, webcalCalendar };
};

export const createWebcalUserSuccess = async () => {
  await AdminUsersService.adminCreateUser({
    body: testUserData,
    // @ts-ignore
    session: {},
  });

  const user = await UserRepository.findByUsername(testUserData.username);

  const webcalCalendar = new WebcalCalendarEntity(
    {
      color: 'indigo',
      name: 'success',
      syncFrequency: 0,
      url: WEBCAL_MOCK_URL_SUCCESS,
      alarms: [],
    },
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  return { user, webcalCalendar };
};

export const createWebcalUserFail = async () => {
  await AdminUsersService.adminCreateUser({
    body: testUserDataWithTwoFactor,
    // @ts-ignore
    session: {},
  });

  const user = await UserRepository.findByUsername(
    testUserDataWithTwoFactor.username
  );

  const webcalCalendar = new WebcalCalendarEntity(
    {
      color: 'pink',
      name: 'fail',
      syncFrequency: 0,
      url: WEBCAL_MOCK_URL_FAIL,
      alarms: [],
    },
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  return { user, webcalCalendar };
};
