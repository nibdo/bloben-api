import AdminUsersService from '../../../../api/adminUsers/AdminUsersService';
import {
  testUserData,
  testUserDataWithTwoFactor,
} from '../../../seeds/1-user-seed';
import UserRepository from '../../../../data/repository/UserRepository';
import WebcalCalendarEntity from '../../../../data/entity/WebcalCalendarEntity';
import {
  WEBCAL_MOCK_URL_FAIL,
  WEBCAL_MOCK_URL_SUCCESS,
} from '../../../__mocks__/AxiosService';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';
import axios from "axios";

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
    },
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  return { user, webcalCalendar };
};
