// eslint-disable-next-line @typescript-eslint/no-var-requires
import { seedUserEmailConfig } from '../../seeds/userEmailConfig';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
import {
  EmailEventJobData,
  processEmailEventJob,
} from '../../../../jobs/queueJobs/processEmailEventJob';
import {
  createDummyCalDavEvent,
  createDummyCalDavEventFromInvite,
  seedCalDavEvents,
} from '../../seeds/calDavEvents';
import { seedCalDavCalendars } from '../../seeds/calDavCalendars';
import { seedUser } from '../../seeds/user-seed';

import { BLOBEN_EVENT_KEY } from '../../../../utils/enums';
import { CALENDAR_METHOD } from '../../../../utils/ICalHelper';
import { mockTsDav } from '../../../__mocks__/tsdav';
import CalDavCalendarEntity from '../../../../data/entity/CalDavCalendar';

describe(`processEmailEventJob [JOB]`, async function () {
  let userID: string;
  let calendar: CalDavCalendarEntity;

  beforeEach(async () => {
    const user = await seedUser();
    userID = user.id;

    const { calDavCalendar } = await seedCalDavCalendars(userID);

    calendar = calDavCalendar;

    await seedUserEmailConfig(userID, calDavCalendar.id);

    mockTsDav();
  });

  it('Should create new event', async function () {
    const job: any = {
      data: {
        icalString: createDummyCalDavEvent(calendar.id).iCalString,
        userID,
        from: 'from@bloben.com',
        to: 'to@bloben.com',
      } as EmailEventJobData,
    };

    const result = await processEmailEventJob(job);

    assert.equal(result.msg, 'Event created');
  });

  it('Should update event', async function () {
    const event = await seedCalDavEvents(userID, {
      props: {
        [BLOBEN_EVENT_KEY.INVITE_FROM]: 'from@bloben.com',
        [BLOBEN_EVENT_KEY.INVITE_TO]: 'to@bloben.com',
      },
    });

    const job: any = {
      data: {
        icalString: createDummyCalDavEventFromInvite(
          calendar.id,
          event.event.externalID,
          CALENDAR_METHOD.REPLY,
          'from@bloben.com'
        ).iCalString,
        userID,
        from: 'from@bloben.com',
        to: 'to@bloben.com',
      } as EmailEventJobData,
    };

    const result = await processEmailEventJob(job);

    assert.equal(result.msg, 'Event updated');
  });

  it('Should delete event', async function () {
    const event = await seedCalDavEvents(userID, {
      props: {
        [BLOBEN_EVENT_KEY.INVITE_FROM]: 'from@bloben.com',
        [BLOBEN_EVENT_KEY.INVITE_TO]: 'to@bloben.com',
      },
    });

    const job: any = {
      data: {
        icalString: createDummyCalDavEventFromInvite(
          calendar.id,
          event.event.externalID,
          CALENDAR_METHOD.CANCEL
        ).iCalString,
        userID,
        from: 'from@bloben.com',
        to: 'to@bloben.com',
      } as EmailEventJobData,
    };

    const result = await processEmailEventJob(job);

    assert.equal(result.msg, 'Event deleted');
  });

  it('Skip deleted event where I am organizer', async function () {
    const job: any = {
      data: {
        icalString: createDummyCalDavEventFromInvite(
          calendar.id,
          'abcde123567',
          CALENDAR_METHOD.REPLY,
          'to@bloben.com'
        ).iCalString,
        userID,
        from: 'from@bloben.com',
        to: 'to@bloben.com',
      } as EmailEventJobData,
    };

    const result = await processEmailEventJob(job);

    assert.equal(result.msg, 'Event not exists');
  });

  it('Skip canceled event, which is already deleted', async function () {
    const job: any = {
      data: {
        icalString: createDummyCalDavEventFromInvite(
          calendar.id,
          'abcde123567',
          CALENDAR_METHOD.CANCEL,
          'to@bloben.com'
        ).iCalString,
        userID,
        from: 'from@bloben.com',
        to: 'to@bloben.com',
      } as EmailEventJobData,
    };

    const result = await processEmailEventJob(job);

    assert.equal(result.msg, 'Event already canceled');
  });

  it('Update only partstat for my event', async function () {
    const event = await seedCalDavEvents(userID);

    const job: any = {
      data: {
        icalString: createDummyCalDavEventFromInvite(
          calendar.id,
          event.event.externalID,
          CALENDAR_METHOD.REPLY,
          'to@bloben.com',
          `ATTENDEE;CN=a;PARTSTAT=NEEDS-ACTION:mailto:to@bloben.com
          ATTENDEE;CN=a;PARTSTAT=NEEDS-ACTION:mailto:from@bloben.com
          `
        ).iCalString,
        userID,
        from: 'from@bloben.com',
        to: 'to@bloben.com',
      } as EmailEventJobData,
    };

    const result = await processEmailEventJob(job);

    assert.equal(result.msg, 'Partstat updated');
  });
});
