import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

const assert = require('assert');
import { initDatabase } from '../../../utils/initDatabase';
import {
  createDummyWebcal,
  createWebcalUserFail,
  createWebcalUserSuccess,
} from './syncWebcalEventsQueueJob.seed';
import {
  getWebcalendarsForSync,
  syncWebcalEventsQueueJob,
} from '../../../../jobs/queueJobs/syncWebcalEventsQueueJob';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';
import {
  mockAxios,
  WEBCAL_MOCK_URL_FAIL,
  WEBCAL_MOCK_URL_SUCCESS,
} from '../../../__mocks__/AxiosService';
import { DateTime } from 'luxon';

describe(`syncWebcalEventsJob [JOB]`, async function () {
  let successUserID: string;
  let webcalCalendarSuccessID: string;

  let failUserID: string;
  let webcalCalendarFailID: string;

  beforeEach(async () => {
    await initDatabase();

    const resultSuccess = await createWebcalUserSuccess();
    successUserID = resultSuccess.user.id;
    webcalCalendarSuccessID = resultSuccess.webcalCalendar.id;

    const resultFail = await createWebcalUserFail();
    failUserID = resultFail.user.id;
    webcalCalendarFailID = resultFail.webcalCalendar.id;

    mockAxios();
  });

  it('Should add attempt on fail job', async function () {
    await syncWebcalEventsQueueJob({
      data: { userID: failUserID },
    } as any);

    const webcalCalendar =
      await WebcalCalendarRepository.getRepository().findOne({
        where: {
          url: WEBCAL_MOCK_URL_FAIL,
        },
      });

    assert.equal(webcalCalendar.attempt, 1);
  });

  it('Should get calendar with 0 attempt and last_sync_at null', async function () {
    const { user } = await createDummyWebcal({
      attempt: 0,
      lastSyncAt: null,
    });

    const result = await getWebcalendarsForSync({ userID: user.id });

    assert.equal(result.length, 1);
  });

  it('Should get calendar with last_sync_at older than sync freq interval', async function () {
    const { user } = await createDummyWebcal({
      attempt: 0,
      syncFrequency: 30,
      lastSyncAt: DateTime.now().minus({ minutes: 40 }).toJSDate(),
    });

    const result = await getWebcalendarsForSync({ userID: user.id });

    assert.equal(result.length, 1);
  });

  it('Should get calendar with attempt > 0 and updated at older than failed' +
      ' sync threshold', async function () {
    const { user } = await createDummyWebcal({
      attempt: 2,
      lastSyncAt: DateTime.now().minus({ hours: 6 }).toJSDate(),
      updatedAt: DateTime.now().minus({ hours: 5 }).toJSDate(),
    });

    const result = await getWebcalendarsForSync({ userID: user.id });

    assert.equal(result.length, 1);
  });

  it('Should not get calendar with no conditions met', async function () {
    const { user } = await createDummyWebcal({
      attempt: 2,
      lastSyncAt: DateTime.now().minus({ minutes: 6 }).toJSDate(),
      updatedAt: DateTime.now().minus({ hours: 1 }).toJSDate(),
    });

    const result = await getWebcalendarsForSync({ userID: user.id });

    assert.equal(result.length, 0);
  });

  it('Should not run right away after failed attempt', async function () {
    await syncWebcalEventsQueueJob({
      data: { userID: failUserID },
    } as any);

    await syncWebcalEventsQueueJob({
      data: { userID: failUserID },
    } as any);

    const webcalCalendar =
      await WebcalCalendarRepository.getRepository().findOne({
        where: {
          url: WEBCAL_MOCK_URL_FAIL,
        },
      });

    assert.equal(webcalCalendar.attempt, 1);
  });

  it('Should save events', async function () {
    await syncWebcalEventsQueueJob({
      data: { userID: successUserID },
    } as any);

    const webcalCalendar =
      await WebcalCalendarRepository.getRepository().findOne({
        where: {
          url: WEBCAL_MOCK_URL_SUCCESS,
        },
      });

    const webcalEvents = await WebcalEventRepository.getRepository().find({
      where: {
        webcalCalendar,
      },
    });

    assert.equal(webcalEvents.length, 1);
  });

  it('Should replace events', async function () {
    await syncWebcalEventsQueueJob({
      data: { userID: successUserID },
    } as any);

    await syncWebcalEventsQueueJob({
      data: { userID: successUserID },
    } as any);

    const webcalCalendar =
      await WebcalCalendarRepository.getRepository().findOne({
        where: {
          url: WEBCAL_MOCK_URL_SUCCESS,
        },
      });

    const webcalEvents = await WebcalEventRepository.getRepository().find({
      where: {
        webcalCalendar,
      },
    });

    assert.equal(webcalEvents.length, 1);
  });
});
