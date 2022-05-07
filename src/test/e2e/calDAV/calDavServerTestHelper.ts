import { createCalDavCalendar } from '../../../api/calDavCalendar/handlers/createCalDavCalendar';
import CalDavCalendarEntity from '../../../data/entity/CalDavCalendar';
import { CALDAV_COMPONENTS } from '../../../bloben-interface/enums';
import { CALDAV_TEST_ACCOUNT } from '../seeds/1-user-caldav-seed';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';
import { createCalDavEvent } from '../../../api/calDavEvent/handlers/createCalDavEvent';
import { v4 } from 'uuid';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import {createDummyCalDavEvent} from "../../integration/seeds/4-calDavEvents";

export const createTestCalendarCalendar = async (
  userID: string,
  account: CalDavAccountEntity
) => {
  const { data } = await createCalDavCalendar(
    {
      body: {
        accountID: account.id,
        name: 'test',
        color: 'blue',
        components: ['VEVENT'],
      },
    } as any,
    { locals: { userID } } as any
  );

  const calendarUrl = `${CALDAV_TEST_ACCOUNT.url}/calendars/${CALDAV_TEST_ACCOUNT.username}/${data.remoteID}/`;
  const newCalendar = new CalDavCalendarEntity();
  newCalendar.url = calendarUrl;
  newCalendar.calDavAccount = account;
  newCalendar.displayName = 'test_new';
  newCalendar.data = JSON.stringify({
    description: '',
    timezone: 'UTC',
    url: calendarUrl,
    ctag: 'http://sabre.io/ns/sync/2021',
    calendarColor: '#330099',
    displayName: 'test_new',
    components: ['VEVENT', 'VTODO'],
    resourcetype: ['collection', 'calendar'],
    syncToken: 'http://sabre.io/ns/sync/2021',
    reports: [
      'expandProperty',
      'principalMatch',
      'principalPropertySearch',
      'principalSearchPropertySet',
      'syncCollection',
      'calendarMultiget',
      'calendarQuery',
      'freeBusyQuery',
    ],
  });
  newCalendar.components = [CALDAV_COMPONENTS.VEVENT, CALDAV_COMPONENTS.VTODO];

  await CalDavCalendarRepository.create(newCalendar);

  return newCalendar;
};

export const createTestCalDavEvent = async (
  userID: string,
  account: CalDavAccountEntity,
  calendarID
): Promise<{ id: string; etag: string; url: string, remoteID: string }> => {
  const remoteID = v4();
  const response = await createCalDavEvent(
    {
      body: {
        externalID: remoteID,
        calendarID: calendarID,
        iCalString: createDummyCalDavEvent(calendarID, remoteID).iCalString,
      },
    } as any,
    {
      locals: { userID },
    } as any
  );

  const eventEntity = await CalDavEventRepository.getRepository().findOne({
    where: {
      externalID: remoteID,
    },
  });

  return { ...response.data, id: eventEntity.id, etag: eventEntity.etag, url: eventEntity.href, remoteID };
};
