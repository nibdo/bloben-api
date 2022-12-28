import {
  ATTENDEE_PARTSTAT,
  REPEATED_EVENT_CHANGE_TYPE,
} from '../../../../data/types/enums';
import { DateTime } from 'luxon';
import { UpdatePartstatStatusRepeatedEventRequest } from 'bloben-interface';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import {
  createE2EUserWithCalendars,
  invalidUUID,
} from '../../../testHelpers/common';
import { createUpdatePartstatRepeatedEventBodyJSON } from '../calDavServerTestHelper';
import { syncCalDavQueueJob } from '../../../../jobs/queueJobs/syncCalDavQueueJob';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (eventID: string) =>
  `/api/app/v1/caldav-events/${eventID}/repeated`;

const createBody = (body: UpdatePartstatStatusRepeatedEventRequest) => body;

const getSyncedEvents = async (
  userID: string,
  remoteID: string,
  calendarID: string
) => {
  await syncCalDavQueueJob({ data: { userID } } as any);

  return CalDavEventRepository.getRepository().find({
    where: {
      externalID: remoteID,
      calendarID,
    },
  });
};

describe(`[E2E] Update partstat status repeated [PATCH] ${PATH}`, async function () {
  const baseDateTime = DateTime.now()
    .set({
      hour: 14,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toUTC();

  it('Should get status 404', async function () {
    const newDate = baseDateTime.plus({ day: 1 });

    const { userID } = await createE2EUserWithCalendars(true);

    const body = createBody(
      createUpdatePartstatRepeatedEventBodyJSON(
        REPEATED_EVENT_CHANGE_TYPE.ALL,
        ATTENDEE_PARTSTAT.ACCEPTED,
        newDate.toUTC().toString(),
        newDate.toUTC().toString()
      )
    );
    const response: any = await request(createE2ETestServerWithSession(userID))
      .patch(PATH(invalidUUID))
      .send(body);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200 all', async function () {
    const newDate = baseDateTime.plus({ day: 1 });

    const { userID, eventData, calendarID } = await createE2EUserWithCalendars(
      true
    );

    const body = createBody(
      createUpdatePartstatRepeatedEventBodyJSON(
        REPEATED_EVENT_CHANGE_TYPE.ALL,
        ATTENDEE_PARTSTAT.ACCEPTED,
        newDate.toUTC().toString(),
        newDate.toUTC().toString()
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .patch(PATH(eventData.id))
      .send(body);

    const { status } = response;

    assert.equal(status, 200);

    const events = await getSyncedEvents(
      userID,
      eventData.remoteID,
      calendarID
    );

    assert.equal(events.length, 1);
  });

  it('Should get status 200 single with no existing recurrence', async function () {
    const newDate = baseDateTime.plus({ day: 1 });

    const { userID, eventData } = await createE2EUserWithCalendars(true);

    const body = createBody(
      createUpdatePartstatRepeatedEventBodyJSON(
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        ATTENDEE_PARTSTAT.ACCEPTED,
        newDate.toUTC().toString(),
        newDate.toUTC().toString(),
        {
          value: newDate.toUTC().toString(),
        }
      )
    );

    const response: any = await request(createE2ETestServerWithSession(userID))
      .patch(PATH(eventData.id))
      .send(body);

    const { status } = response;

    assert.equal(status, 200);
  });
});
