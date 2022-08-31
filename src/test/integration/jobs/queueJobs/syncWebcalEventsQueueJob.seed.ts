import {
  WEBCAL_MOCK_URL_FAIL,
  WEBCAL_MOCK_URL_SUCCESS,
} from '../../../__mocks__/AxiosService';
import { seedUserWithEntity } from '../../seeds/1-user-seed';
import WebcalCalendarEntity from '../../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';

export const createDummyWebcal = async (data: {
  attempt: number;
  lastSyncAt: Date | null;
  syncFrequency?: number;
  updatedAt?: Date | undefined;
}) => {
  const { user } = await seedUserWithEntity();

  const webcalCalendar = new WebcalCalendarEntity(
    {
      color: 'indigo',
      name: 'success',
      syncFrequency: data.syncFrequency,
      url: WEBCAL_MOCK_URL_SUCCESS,
      alarms: [],
      userMailto: null,
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
  const { user } = await seedUserWithEntity();

  const webcalCalendar = new WebcalCalendarEntity(
    {
      color: 'indigo',
      name: 'success',
      syncFrequency: 1,
      url: WEBCAL_MOCK_URL_SUCCESS,
      alarms: [],
      userMailto: null,
    },
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  return { user, webcalCalendar };
};

export const createWebcalUserFail = async () => {
  const { user } = await seedUserWithEntity();

  const webcalCalendar = new WebcalCalendarEntity(
    {
      color: 'pink',
      name: 'fail',
      syncFrequency: 1,
      url: WEBCAL_MOCK_URL_FAIL,
      alarms: [],
      userMailto: null,
    },
    user
  );

  await WebcalCalendarRepository.getRepository().save(webcalCalendar);

  return { user, webcalCalendar };
};
