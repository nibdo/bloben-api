import { DAVCalendarObject } from 'tsdav';
import { DAV_ACCOUNT_TYPE } from '../../../../data/types/enums';
import { ImportMock } from 'ts-mock-imports';
import { forEach } from 'lodash';
import { formatEventJsonToCalDavEvent } from '../../../../utils/davHelper';
import { generateRandomString } from '../../../../utils/common';
// eslint-disable-next-line unused-imports/no-unused-imports-ts,@typescript-eslint/no-unused-vars
import { io } from '../../../../app';
import { seedUserWithEntity } from '../../seeds/user-seed';
import {
  testIcalStringTimeFormat,
  testIcalStringUnsupportedZone,
  testIcalStringWrongDate,
} from '../../seeds/calDavEvents';
import CalDavAccountEntity from '../../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavCalendarEntity from '../../../../data/entity/CalDavCalendar';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';
import CalDavEventEntity from '../../../../data/entity/CalDavEventEntity';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import ICalParser, { EventJSON } from 'ical-js-parser';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsdav = require('tsdav');

const createTestIcalString = (id: string, summary?: string) =>
  `BEGIN:VCALENDAR
METHOD:REQUEST
PRODID:Test
VERSION:2.0
BEGIN:VEVENT
UID:${id}
SUMMARY:${summary ? summary : 'Old value'}
DTSTART:20210401T110000Z
DTEND:20210401T113000Z
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

export const calendarToInsertID = 'dfb57b9c-71dc-4cfa-88b0-8c01dbd0ce0c';
export const calendarToUpdateID = '1d47a736-8c55-4d55-a36a-73331f3f8023';
export const calendarToDeleteID = 'dc8f142e-07b1-476e-84e1-87761543719c';

export const eventToInsertID = 'fd4acf38-40d7-4d33-b708-da1df05d18e1';
export const eventToUpdateID = '1ad4b4f3-f4d3-47ff-93d2-99a8eec4c0b2';
export const eventToKeepID = '3235e010-5678-4975-aa05-56b4747fbd4c';
export const eventToDeleteID = 'bebdce1a-f576-4b38-9ac7-e301ab32d6f9';

const etagToKeep = 'FGHBAFJi123';

const prepareData = async (accountUrl: string, calendarUrl: string) => {
  const { user } = await seedUserWithEntity();
  const newAccount = new CalDavAccountEntity(
    {
      username: 'username1',
      password: 'aaabbbb',
      url: accountUrl,
      accountType: DAV_ACCOUNT_TYPE.CALDAV,
    },
    user
  );
  newAccount.principalUrl = accountUrl;
  newAccount.serverUrl = accountUrl;
  newAccount.rootUrl = accountUrl;
  newAccount.homeUrl = accountUrl;

  const calendarIDS = [calendarToUpdateID, calendarToDeleteID];

  const calendars: CalDavCalendarEntity[] = [];
  let defaultCalendar;

  forEach(calendarIDS, (id) => {
    const newCalendar = new CalDavCalendarEntity();

    newCalendar.calDavAccount = newAccount;
    newCalendar.displayName = 'default';
    newCalendar.data = JSON.stringify({ displayName: 'default' });
    newCalendar.ctag = 'AB1212341';
    newCalendar.url = `${accountUrl}/${id}`;

    calendars.push(newCalendar);

    if (id === calendarToUpdateID) {
      defaultCalendar = newCalendar;
    }
  });

  await CalDavAccountRepository.getRepository().save(newAccount);
  await CalDavCalendarRepository.getRepository().save(calendars);

  const events: CalDavEventEntity[] = [];

  const eventIDS = [eventToUpdateID, eventToKeepID, eventToDeleteID];

  forEach(eventIDS, (id) => {
    const icalJS = ICalParser.toJSON(createTestIcalString(id));
    const eventJSON: EventJSON = icalJS.events[0];
    const eventObj = formatEventJsonToCalDavEvent(
      eventJSON,
      {
        data: '',
        etag: id === eventToKeepID ? etagToKeep : generateRandomString(20),
        url: `${calendarUrl}/${id}`,
      } as DAVCalendarObject,
      defaultCalendar
    );

    events.push(new CalDavEventEntity(eventObj));
  });

  await CalDavEventRepository.getRepository().save(events);

  return user;
};

const prepareMock = (accountUrl: string) => {
  ImportMock.restore();

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  io = {
    to: () => {
      return {
        emit: () => {
          return;
        },
      };
    },
  };

  tsdav.fetchCalendars = () => {
    const calendarIDS = [calendarToInsertID, calendarToUpdateID];

    return calendarIDS.map((id) => ({
      components: ['VEVENT', 'VTODO'],
      ctag: 'BGTPY123111',
      displayName: 'default',
      url: `${accountUrl}/${id}`,
    }));
  };

  tsdav.calendarQuery = () => {
    const eventIDS = [eventToInsertID, eventToUpdateID, eventToKeepID];

    return eventIDS.map((id) => ({
      raw: '',
      href: `${accountUrl}/${calendarToUpdateID}/${id}`,
      status: 200,
      statusText: 'Ok',
      ok: true,
      props: {
        getetag: id === eventToKeepID ? etagToKeep : 'xxv1v87sd4v7sd8v1sd7v',
      },
    }));
  };

  tsdav.fetchCalendarObjects = () => {
    const eventIDS = [eventToInsertID, eventToUpdateID, eventToKeepID];

    const events = eventIDS.map((id) => ({
      data: createTestIcalString(
        id,
        id === eventToKeepID ? undefined : 'New value'
      ),
      etag: id === eventToKeepID ? etagToKeep : 'xxv1v87sd4v7sd8v1sd7v',
      url: `${accountUrl}/${calendarToUpdateID}/${id}`,
    }));

    events.push({
      data: testIcalStringWrongDate,
      etag: '221xv1v87sd4v7sd8v1sd7v',
      url: `${accountUrl}/asfasf/asfasfasf242`,
    });

    events.push({
      data: testIcalStringUnsupportedZone,
      etag: '221xv1v87sd4v7sd38v1sd7v',
      url: `${accountUrl}/asfasf/asfasfasf2412`,
    });

    events.push({
      data: testIcalStringTimeFormat,
      etag: '221xv1v87sd4v7sd38v21sd7v',
      url: `${accountUrl}/asfasf/asfasf1asf2412`,
    });

    return events;
  };
};

/**
 *
 * Test insert new event
 * Test updating existing event
 * Test keeping not changed event
 * Test delete event
 *
 * Test creating new calendar
 * Test updating ctag to new value
 * Test deleting calendar
 */
export const initSyncCalDavQueueJobData = async (accountUrl: string) => {
  const calendarUrl = `${accountUrl}/default`;

  // prepare initial data
  const user = await prepareData(accountUrl, calendarUrl);

  // prepare mock data
  await prepareMock(accountUrl);

  return user;
};
