import { DateTime } from 'luxon';
import { calculateRepeatedReminders } from '../../../../../jobs/cronJobs/calculateRepatedReminders';
import {
  createDummyCalDavEventWithRepeatedAlarm,
  seedCalDavEvents,
} from '../../../seeds/4-calDavEvents';
import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { getTestReminders } from '../../../../testHelpers/getTestReminders';
import { mockTsDavEvent } from '../../../../__mocks__/tsdav';
import { seedUsers } from '../../../seeds/1-user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/caldav-events';

describe(`calculateRepeatedReminders [JOB]`, async function () {
  let repeatedEventData;
  let userID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    const { repeatedEvent } = await seedCalDavEvents(userID);
    repeatedEventData = repeatedEvent;
  });

  it('Should calculate repeated reminders', async function () {
    const requestBodyWithAlarmRepeated =
      createDummyCalDavEventWithRepeatedAlarm(
        repeatedEventData.calendar.id,
        DateTime.now()
          .minus({ day: 1 })
          .set({ hour: 14, minute: 44, second: 0, millisecond: 0 })
      );

    mockTsDavEvent(requestBodyWithAlarmRepeated.iCalString);

    await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBodyWithAlarmRepeated);

    await calculateRepeatedReminders();

    const reminders = await getTestReminders(
      requestBodyWithAlarmRepeated.externalID
    );

    const refDate = DateTime.now().set({
      hour: 14,
      minute: 34,
      second: 0,
      millisecond: 0,
    });

    assert.equal(
      reminders?.[0].sendAt.toISOString(),
      refDate.toUTC().toString()
    );
    assert.equal(
      reminders?.[1].sendAt.toISOString(),
      refDate.plus({ day: 1 }).toUTC().toString()
    );
    assert.equal(
      reminders?.[2].sendAt.toISOString(),
      refDate.plus({ day: 2 }).toUTC().toString()
    );
    assert.equal(
      reminders?.[3].sendAt.toISOString(),
      refDate.plus({ day: 3 }).toUTC().toString()
    );
    assert.equal(
      reminders?.[4].sendAt.toISOString(),
      refDate.plus({ day: 4 }).toUTC().toString()
    );
  });
});
