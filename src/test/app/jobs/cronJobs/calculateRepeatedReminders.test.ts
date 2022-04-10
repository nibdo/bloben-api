import { getTestReminders } from '../../../utils/getTestReminders';

const request = require('supertest');
const assert = require('assert');
import { initDatabase } from '../../../utils/initDatabase';
import { initSeeds } from '../../../seeds/init';
import { calculateRepeatedReminders } from '../../../../jobs/cronJobs/calculateRepatedReminders';
import { DateTime } from 'luxon';
import {mockTsDavEvent} from "../../../__mocks__/tsdav";
import {createTestServerWithSession} from "../../../utils/initTestServer";
import {
  createDummyCalDavEventWithRepeatedAlarm
} from "../../../seeds/4-calDavEvents";

const PATH = '/api/v1/caldav-events';

describe(`calculateRepeatedReminders [JOB]`, async function () {
  let repeatedEventData;
  beforeEach(async () => {
    await initDatabase();
    const { repeatedEvent } = await initSeeds();
    repeatedEventData = repeatedEvent;
  });

  it('Should calculate repeated reminders', async function () {
    const requestBodyWithAlarmRepeated =
        createDummyCalDavEventWithRepeatedAlarm(
            repeatedEventData.calendar.id,
            DateTime.now().set({ hour: 14, minute: 44, second: 0, millisecond: 0 })
        );

    mockTsDavEvent(requestBodyWithAlarmRepeated.iCalString)

     await request(createTestServerWithSession())
        .post(PATH)
        .send(requestBodyWithAlarmRepeated);

    await calculateRepeatedReminders();

    const reminders = await getTestReminders(requestBodyWithAlarmRepeated.externalID);

    const refDate = DateTime.now().set({
      hour: 14,
      minute: 34,
      second: 0,
      millisecond: 0,
    });

    assert.equal(reminders.length, 8);
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
