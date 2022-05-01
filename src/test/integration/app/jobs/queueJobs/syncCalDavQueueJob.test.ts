import {
  calendarToDeleteID,
  calendarToInsertID,
  calendarToUpdateID,
  eventToDeleteID,
  eventToInsertID,
  eventToKeepID,
  eventToUpdateID,
  initSyncCalDavQueueJobData,
} from './syncCalDavQueueJob.seed';

const assert = require('assert');
import { syncCalDavQueueJob } from '../../../../../jobs/queueJobs/syncCalDavQueueJob';
import CalDavCalendarRepository from '../../../../../data/repository/CalDavCalendarRepository';
import CalDavEventRepository from '../../../../../data/repository/CalDavEventRepository';
import { initDatabase } from '../../../../testHelpers/initDatabase';

describe(`syncCalDavQueueJob [JOB]`, async function () {
  let userID: string;
  const accountUrl = 'http://localhost:3000';

  beforeEach(async () => {
    await initDatabase();
    const user = await initSyncCalDavQueueJobData(accountUrl);

    userID = user.id;
  });

  it('Should insert new server calendar', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const url = `${accountUrl}/${calendarToInsertID}`;
    const calendar = await CalDavCalendarRepository.getRepository().findOne({
      where: {
        url,
      },
    });

    assert.equal(calendar.url, url);
  });

  it('Should keep old calendar', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const url = `${accountUrl}/${calendarToUpdateID}`;
    const calendar = await CalDavCalendarRepository.getRepository().findOne({
      where: {
        url,
      },
    });

    assert.equal(calendar.url, url);
  });

  it('Should delete remote calendar', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const url = `${accountUrl}/${calendarToDeleteID}`;
    const calendar = await CalDavCalendarRepository.getRepository().findOne({
      where: {
        url,
      },
    });

    assert.equal(calendar, undefined);
  });

  it('Should insert new event', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: eventToInsertID,
      },
    });

    assert.equal(event.externalID, eventToInsertID);
  });

  it('Should keep not changed event', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: eventToKeepID,
      },
    });

    assert.equal(event.externalID, eventToKeepID);
    assert.equal(event.summary, 'Old value');
    assert.equal(event.etag, 'FGHBAFJi123');
  });

  it('Should update changed event', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: eventToUpdateID,
      },
    });

    assert.equal(event.externalID, eventToUpdateID);
    assert.equal(event.summary, 'New value');
  });

  it('Should delete remote event', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: eventToDeleteID,
      },
    });

    assert.equal(event, undefined);
  });

  it('Should save time format event with date 20210201T080000Z', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: '0400asf14151515',
      },
    });

    assert.notEqual(event, undefined);
    assert.equal(event.externalID, '0400asf14151515');
    assert.equal(event.startAt.toISOString(), '2021-02-01T08:00:00.000Z');
    assert.equal(event.endAt.toISOString(), '2021-02-01T10:00:00.000Z');
  });

  it('Should not save event with not supported date format', async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const eventA = await CalDavEventRepository.getRepository().findOne({
      where: {
        summary: 'teaaaaa41515311111',
      },
    });

    const eventB = await CalDavEventRepository.getRepository().findOne({
      where: {
        summary: 'ABCDE9812345',
      },
    });

    assert.equal(eventA, undefined);
    assert.equal(eventB, undefined);
  });
});
