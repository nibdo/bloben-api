import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

const assert = require('assert');
import { initDatabase } from '../../../utils/initDatabase';
import {
  createWebcalUserFail,
  createWebcalUserSuccess,
} from './syncWebcalEventsQueueJob.seed';
import { syncWebcalEventsQueueJob } from '../../../../jobs/queueJobs/syncWebcalEventsQueueJob';
import WebcalCalendarRepository from '../../../../data/repository/WebcalCalendarRepository';
import {
  mockAxios,
  WEBCAL_MOCK_URL_FAIL,
  WEBCAL_MOCK_URL_SUCCESS,
} from '../../../__mocks__/AxiosService';

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
