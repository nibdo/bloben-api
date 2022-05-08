import { REMINDER_STATUS } from '../../../../../data/entity/ReminderEntity';

const assert = require('assert');
import { initDatabase } from '../../../../testHelpers/initDatabase';
import { initSeeds } from '../../../seeds/init';
import { createTestReminder, getTestReminder } from '../../../../testHelpers/common';
import { DateTime } from 'luxon';
import { sendNotification } from '../../../../../jobs/cronJobs/sendNotification';

describe(`sendReminders [JOB]`, async function () {
  let eventData;
  let userData;
  beforeEach(async () => {
    await initDatabase();
    const { user, event } = await initSeeds();
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
