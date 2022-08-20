import { DateTime } from 'luxon';
import { REMINDER_STATUS } from '../../../../../data/entity/ReminderEntity';
import {
  createTestReminder,
  getTestReminder,
} from '../../../../testHelpers/common';
import { seedCalDavEvents } from '../../../seeds/4-calDavEvents';
import { seedUserWithEntity } from '../../../seeds/1-user-seed';
import { sendNotification } from '../../../../../jobs/cronJobs/sendNotification';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');

describe(`sendReminders [JOB]`, async function () {
  let eventData;
  let userData;

  beforeEach(async () => {
    const { user } = await seedUserWithEntity();
    const { event } = await seedCalDavEvents(user.id);
    eventData = event;
    userData = user;
  });

  it('Should not send reminder for past event', async function () {
    const date = DateTime.now().minus({ hour: 1 }).toString();
    const newReminder = await createTestReminder(eventData, date, userData);

    await sendNotification();

    const resultReminder = await getTestReminder(newReminder.id);
    assert.equal(resultReminder.wasFired, false);
    assert.equal(resultReminder.status, REMINDER_STATUS.INITIALIZED);
  });

  it('Should not send reminder after max attempts', async function () {
    const date = DateTime.now().toString();
    const newReminder = await createTestReminder(eventData, date, userData, 5);

    await sendNotification();

    const resultReminder = await getTestReminder(newReminder.id);
    assert.equal(resultReminder.wasFired, false);
    assert.equal(resultReminder.attempt, 5);
    assert.equal(resultReminder.status, REMINDER_STATUS.INITIALIZED);
  });

  it('Should not send future reminder', async function () {
    const date = DateTime.now().plus({ minute: 15 }).toString();
    const newReminder = await createTestReminder(eventData, date, userData);

    await sendNotification();

    const resultReminder = await getTestReminder(newReminder.id);
    assert.equal(resultReminder.wasFired, false);
    assert.equal(resultReminder.attempt, 0);
    assert.equal(resultReminder.status, REMINDER_STATUS.INITIALIZED);
  });

  it('Should send reminder', async function () {
    const date = DateTime.now().minus({ second: 30 }).toString();
    const newReminder = await createTestReminder(eventData, date, userData);

    await sendNotification();

    const resultReminder = await getTestReminder(newReminder.id);

    assert.equal(resultReminder.wasFired, true);
    assert.equal(resultReminder.attempt, 1);
    assert.equal(resultReminder.status, REMINDER_STATUS.SUCCESS);
  });
});
