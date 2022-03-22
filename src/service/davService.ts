import { CalDavAccount } from '../data/repository/CalDavAccountRepository';
import { DAVCalendarObject, DAVClient, DAVCredentials } from 'tsdav';
import { LOG_TAG } from '../utils/enums';
import { Range } from '../bloben-interface/interface';
import { createEventsFromCalendarObject } from '../utils/davHelper';
import { forEach } from 'lodash';
import { throwError } from '../utils/errorCodes';
import CalDavCalendarRepository from '../data/repository/CalDavCalendarRepository';
import logger from '../utils/logger';

export const createDavClient = (
  url: string,
  auth: DAVCredentials | undefined
) => {
  if (!auth) {
    throw Error('Missing credentials');
  }
  return new DAVClient({
    serverUrl: url,
    credentials: {
      username: auth.username,
      password: auth.password,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
};

export const loginToCalDav = async (
  url: string,
  auth: DAVCredentials | undefined
) => {
  try {
    const client = createDavClient(url, auth);

    await client.login();

    return client;
  } catch (e: any) {
    logger.error('Cannot login to calDav server', e, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);

    throw throwError(409, 'Cannot login to calDav server');
  }
};

export const createAuthHeader = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

/**
 * Sync all events for all calendars in range
 * @param range
 */
export const syncCalDavEventsInRange = async (
  account: CalDavAccount,
  client: DAVClient,
  range: Range
): Promise<any[]> => {
  const calDavCalendars: any =
    await CalDavCalendarRepository.getRepository().query(
      `
      SELECT 
        c.id as id, 
        c.data as data
      FROM 
        caldav_calendars c
      WHERE
        c.caldav_account_id = $1
        AND c.deleted_at IS NULL;
    `,
      [account.id]
    );

  let resultEvents: any[] = [];

  for (const calDavCalendar of calDavCalendars) {
    const params: any = {
      calendar: JSON.parse(calDavCalendar.data),
      timeRange: {
        start: range.rangeFrom,
        end: range.rangeTo,
      },
    };

    const response: DAVCalendarObject[] = await client.fetchCalendarObjects(
      params
    );

    forEach(response, (item) => {
      if (item.data) {
        resultEvents = [
          ...resultEvents,
          ...createEventsFromCalendarObject(item, calDavCalendar, range),
        ];
      }
    });
  }

  return resultEvents;
};
