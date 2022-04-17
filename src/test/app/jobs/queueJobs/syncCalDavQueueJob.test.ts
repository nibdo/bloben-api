import {
  calendarToDeleteID,
  calendarToInsertID,
  calendarToUpdateID,
  eventToDeleteID,
  eventToInsertID,
  eventToKeepID,
  eventToUpdateID,
  initSyncCalDavQueueJobData,
} from "./syncCalDavQueueJob.seed";

const assert = require("assert");
import { syncCalDavQueueJob } from "../../../../jobs/queueJobs/syncCalDavQueueJob";
import CalDavCalendarRepository from "../../../../data/repository/CalDavCalendarRepository";
import CalDavEventRepository from "../../../../data/repository/CalDavEventRepository";
import {initDatabase} from "../../../utils/initDatabase";

describe(`syncCalDavQueueJob [JOB]`, async function () {
  let userID: string;
  const accountUrl = "http://localhost:3000";

  beforeEach(async () => {
    await initDatabase()
    const user = await initSyncCalDavQueueJobData(accountUrl);

    userID = user.id;
  });

  it("Should insert new server calendar", async function () {
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

  it("Should keep old calendar", async function () {
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

  it("Should delete remote calendar", async function () {
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

  it("Should insert new event", async function () {
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

  it("Should keep not changed event", async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: eventToKeepID,
      },
    });

    assert.equal(event.externalID, eventToKeepID);
    assert.equal(event.summary, "Old value");
    assert.equal(event.etag, "FGHBAFJi123");
  });

  it("Should update changed event", async function () {
    await syncCalDavQueueJob({
      data: { userID },
    } as any);

    const event = await CalDavEventRepository.getRepository().findOne({
      where: {
        externalID: eventToUpdateID,
      },
    });

    assert.equal(event.externalID, eventToUpdateID);
    assert.equal(event.summary, "New value");
  });

  it("Should delete remote event", async function () {
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
});
