import {
  AccountWithCalendars,
  CalendarFromAccount,
} from '../data/repository/CalDavAccountRepository';
import { CALENDAR_METHOD } from './ICalHelper';
import { CalDavCacheService } from '../service/CalDavCacheService';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { DAVCalendar, DAVCalendarObject, DAVClient } from 'tsdav';
import { DateTime } from 'luxon';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from './enums';
import { Range } from '../bloben-interface/interface';
import { cloneDeep, find, forEach, map } from 'lodash';
import {
  createCalDavCalendar,
  updateCalDavCalendar,
} from '../api/caldavAccount/helpers/createCalDavCalendar';
import { createDavClient } from '../service/davService';
import {
  formatEventCancelSubject,
  formatEventEntityToResult,
  formatEventInviteSubject,
} from './format';
import { formatToRRule } from './common';
import { io } from '../app';
import { processCaldavAlarms } from '../api/calDavEvent/handlers/updateCalDavEvent';
import { v4 } from 'uuid';
import CalDavCalendarEntity from '../data/entity/CalDavCalendar';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../data/repository/CalDavEventRepository';
import ICalParser, { EventJSON } from 'ical-js-parser-dev';
import LuxonHelper from './luxonHelper';
import RRule from 'rrule';
import logger from './logger';

export interface CalDavEventObj {
  externalID: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezone: string | null;
  isRepeated: boolean;
  summary: string;
  location: string | null;
  description: string | null;
  etag: string;
  color: string;
  alarms: any;
  rRule: string | null;
  href: string;
  [key: string]: any;
}

export const formatDTStartValue = (event: EventJSON, isAllDay: boolean) => {
  let result;

  isAllDay
    ? (result = DateTime.fromFormat(event.dtstart.value, 'yyyyMMdd')
        .toISO()
        .toString())
    : (result = event.dtstart.value);

  return result;
};
export const formatDTEndValue = (event: EventJSON, isAllDay: boolean) => {
  let result;

  if (!event.dtend?.value) {
    result = formatDTStartValue(event, isAllDay);
  } else {
    isAllDay
      ? (result = DateTime.fromFormat(event.dtend.value, 'yyyyMMdd')
          .minus({ day: 1 })
          .set({ hour: 0, minute: 0, second: 0 })
          .toISO()
          .toString())
      : (result = event.dtend.value);
  }

  return result;
};

export const formatEventJsonToCalDavEvent = (
  event: EventJSON,
  calendarObject: DAVCalendarObject,
  calendar: CalDavCalendarEntity
): CalDavEventObj => {
  const isAllDay = event?.dtstart?.value?.length === '20220318'.length;

  return {
    props: removeSupportedProps(event),
    ...{ ...calendarObject, data: null }, // clear ical data prop
    calendarID: calendar.id,
    externalID: event.uid || '',
    startAt: formatDTStartValue(event, isAllDay),
    endAt: formatDTEndValue(event, isAllDay),
    allDay: isAllDay,
    timezone: isAllDay ? 'floating' : event.dtstart.timezone || null,
    isRepeated: event.rrule !== undefined || false,
    rRule: event.rrule || null,
    summary: event.summary || '',
    location: event.location || null,
    description: event.description || null,
    etag: calendarObject.etag,
    color: event.color || null,
    alarms: event.alarms,
    href: calendarObject.url,
  };
};
export const checkCalendarChange = (
  localCalendar: CalendarFromAccount,
  serverCalendar: DAVCalendar
) => {
  if (
    localCalendar.description !== serverCalendar.description ||
    localCalendar.timezone !== serverCalendar.timezone ||
    localCalendar.ctag !== serverCalendar.ctag ||
    // @ts-ignore
    localCalendar.calendarColor !== serverCalendar.calendarColor ||
    localCalendar.displayName !== serverCalendar.displayName
  ) {
    return true;
  }

  return false;
};

const isException = (date: Date, event: any): boolean => {
  if (!event.exceptions || event.exceptions.length === 0) {
    return false;
  }

  const dateString: string = date.toISOString();
  if (event.exceptions.includes(dateString)) {
    return true;
  }

  return false;
};

export const getRepeatedEvents = (event: any, range: Range) => {
  const rangeFromDateTime = DateTime.fromISO(range.rangeFrom);
  const rangeToDateTime = DateTime.fromISO(range.rangeTo);

  const result: any = [];

  if (!event.rRule) {
    return result;
  }

  const rRule = RRule.fromString(formatToRRule(event.rRule, event.startAt));

  const diffInMinutes: number = LuxonHelper.getDiffInMinutes2(
    event.startAt,
    event.endAt
  );

  // check if event starts in DST
  const eventStartsInDST: boolean = DateTime.fromISO(event.startAt).setZone(
    event.timezone || 'Europe/Berlin'
  ).isInDST;

  const rRuleResults: Date[] = rRule.between(
    new Date(
      rangeFromDateTime.year,
      rangeFromDateTime.month - 1,
      rangeFromDateTime.day,
      rangeFromDateTime.hour,
      rangeFromDateTime.minute
    ),
    new Date(
      rangeToDateTime.year,
      rangeToDateTime.month - 1,
      rangeToDateTime.day,
      rangeToDateTime.hour,
      rangeToDateTime.minute
    )
  );

  forEach(rRuleResults, (rRuleResult: Date) => {
    const eventClone = cloneDeep(event);

    let startAtDateTime: DateTime = DateTime.fromISO(rRuleResult.toISOString());

    // check if start of repeated event is in DST
    const repeatedEventStartsInDST: boolean = startAtDateTime.setZone(
      event.timezone || 'Europe/Berlin'
    ).isInDST;

    // set proper "wall" time for repeated dates across DST changes
    if (!eventStartsInDST && repeatedEventStartsInDST) {
      startAtDateTime = startAtDateTime.minus({ hours: 1 });
    }

    if (eventStartsInDST && !repeatedEventStartsInDST) {
      startAtDateTime = startAtDateTime.plus({ hours: 1 });
    }

    eventClone.internalID = v4();
    eventClone.startAt = startAtDateTime.toUTC().toString();
    eventClone.endAt = startAtDateTime
      .plus({ minutes: diffInMinutes })
      .toUTC()
      .toString();

    if (!isException(rRuleResult, event)) {
      result.push(eventClone);
    }
  });

  return result;
};

const getRepeatedEvent = (events: EventJSON[]): EventJSON => {
  const result = events.filter((event) => {
    if (event.rrule) {
      return event;
    }
  });

  return result[0];
};

// Note id and url are not linked
export const createEventFromCalendarObject = (
  calendarObject: DAVCalendarObject,
  calendar: any
) => {
  const icalJS = ICalParser.toJSON(calendarObject.data);
  const event: EventJSON = icalJS.events[0];

  if (icalJS.errors?.length) {
    logger.warn(
      `Parsing event from caldav event string error ${JSON.stringify(
        icalJS.errors
      )}`,
      [LOG_TAG.CRON, LOG_TAG.CALDAV]
    );
  }

  if (event) {
    return formatEventJsonToCalDavEvent(event, calendarObject, calendar);
  }
};

// Note id and url are not linked
export const createEventsFromCalendarObject = (
  calendarObject: DAVCalendarObject,
  calendar: any,
  range?: Range
): any[] => {
  const icalJS = ICalParser.toJSON(calendarObject.data);
  const event: EventJSON = icalJS.events[0];

  if (range) {
    // if there are more than one event, it means others are occurrences
    if (event.rrule && event.rrule !== '') {
      // find event with rrule prop to calculate occurrences
      const eventWithRRule = formatEventJsonToCalDavEvent(
        getRepeatedEvent(icalJS.events),
        calendarObject,
        calendar
      );

      const repeatedEvents = getRepeatedEvents(eventWithRRule, range);

      // TODO
      // now find if there is recurrence id for that date and use it instead
      // of calculated result

      // save both original and repeated clones

      const mergedEvents =
        repeatedEvents.length > 0 ? repeatedEvents : [eventWithRRule];

      return mergedEvents;
    }
  }

  return [formatEventJsonToCalDavEvent(event, calendarObject, calendar)];
};

export const queryClient = async (client: DAVClient, serverCalendar: any) =>
  client.calendarQuery({
    url: serverCalendar.url,
    // @ts-ignore
    _attributes: {
      'xmlns:D': 'DAV:',
      'xmlns:C': 'urn:ietf:params:xml:ns:caldav',
    },
    prop: {
      getetag: {}, // or 'd:getetag'
    },
    filters: {
      'comp-filter': {
        _attributes: {
          name: 'VCALENDAR',
        },
        // "comp-filter": {
        //   _attributes: {
        //     name: "VEVENT",
        //   },
        // },
      },
    },
    depth: '1',
  });

export const updateCalDavEvents = async (
  calDavCalendar: any,
  client: any,
  queryRunner: QueryRunner,
  userID: string
) => {
  const calDavServerResult: any = await queryClient(client, calDavCalendar);

  // get existing events
  const existingEvents: {
    id: string;
    etag: string;
    externalID: string;
  }[] = await CalDavEventRepository.getRepository().query(
    `
        SELECT
            e.id as id,
            e.etag as etag,
            e.href as href,
            e.external_id as "externalID"
        FROM 
            caldav_events e
        WHERE
            e.caldav_calendar_id = $1
            AND e.deleted_at IS NULL
      `,
    [calDavCalendar.id]
  );

  const toInsert: string[] = [];
  const toDelete: string[] = [];
  const toSoftDelete: string[] = [];
  const softDeleteExternalID: string[] = [];

  // filter events to insert, update or delete
  forEach(calDavServerResult, (calDavServerItem: any) => {
    let foundLocalItem: any = null;

    forEach(existingEvents, (existingEvent: any) => {
      if (existingEvent.href.includes(calDavServerItem.href)) {
        foundLocalItem = existingEvent;

        if (calDavServerItem.props.getetag !== existingEvent.etag) {
          toInsert.push(calDavServerItem.href);
          toDelete.push(existingEvent.id);
        }
      }
    });

    if (!foundLocalItem) {
      // handle inserts
      if (calDavServerItem.href) {
        toInsert.push(calDavServerItem.href);
      }
    }
  });

  // Clean local events
  forEach(existingEvents, (existingEvent: any) => {
    let foundItem: any;
    forEach(calDavServerResult, (calDavServerItem: any) => {
      if (existingEvent.href.includes(calDavServerItem.href)) {
        foundItem = calDavServerItem;
      }
    });

    if (!foundItem) {
      toSoftDelete.push(existingEvent.id);
      softDeleteExternalID.push(existingEvent.externalID);
    }
  });

  // delete events
  if (toSoftDelete.length > 0) {
    await queryRunner.manager.query(
      `
    UPDATE
      caldav_events 
    SET
       deleted_at = now()
    WHERE
        id = ANY($1)
  `,
      [toSoftDelete]
    );
  }

  if (toDelete.length > 0) {
    await queryRunner.manager.query(
      `
    DELETE FROM
      caldav_events 
    WHERE
        id = ANY($1)
  `,
      [toDelete]
    );
  }

  const eventsToSync: any = [];

  if (toInsert.length > 0 || toDelete.length > 0 || toSoftDelete.length > 0) {
    await CalDavCacheService.deleteByUserID(userID);
  }

  if (toInsert.length > 0) {
    const toInsertResponse: any = await getCalendarObjectsByUrl(
      client,
      calDavCalendar,
      toInsert
    );

    const promises: any = [];
    forEach(toInsertResponse, (item: any) => {
      if (item.data) {
        try {
          const eventTemp = createEventFromCalendarObject(item, calDavCalendar);

          if (eventTemp) {
            const newEvent = new CalDavEventEntity(eventTemp);
            eventsToSync.push(formatEventEntityToResult(newEvent));
            promises.push(queryRunner.manager.save(newEvent));

            if (eventTemp.alarms) {
              promises.push(
                processCaldavAlarms(queryRunner, eventTemp.alarms, newEvent)
              );
            }
          }
        } catch (e) {
          logger.error(
            `Creating event from caldav event string error with event ${item.data}`,
            e,
            [LOG_TAG.CRON, LOG_TAG.CALDAV]
          );
        }
      }
    });

    await Promise.all(promises);
  }

  return {
    eventsToUpdate: eventsToSync,
    eventsToDelete: softDeleteExternalID,
  };
};

export const getCalendarObjectsByUrl = async (
  client: DAVClient,
  calDavCalendar: DAVCalendar,
  // range: any,
  objectUrls: string[]
) => {
  const params: any = {
    calendar: calDavCalendar,
    // timeRange: {
    //   start: range.rangeFrom,
    //   end: range.rangeTo
    // },
    objectUrls,
  };

  const response: DAVCalendarObject[] = await client.fetchCalendarObjects(
    params
  );

  return response;
};

const syncEventsForAccount = async (calDavAccount: AccountWithCalendars) => {
  const calDavCalendars: CalendarFromAccount[] = calDavAccount.calendars
    ? calDavAccount.calendars
    : [calDavAccount.calendar];

  const client = createDavClient(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });
  await client.login();

  // fetch calendars
  const serverCalendars = await client.fetchCalendars();

  const calendarsToInsert: any[] = [];
  const calendarsToUpdate: any[] = [];
  const calendarsToDelete: any[] = [];

  const calendarsWithChangedEvents: DAVCalendar[] = [];
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  let calendarsChanged = false;
  try {
    connection = null;
    queryRunner = null;

    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    for (const serverCalendar of serverCalendars) {
      const localCalendar = find(
        calDavCalendars,
        (calDavCalendar: CalendarFromAccount) =>
          calDavCalendar.url.includes(serverCalendar.url)
      );

      if (localCalendar) {
        // update
        if (checkCalendarChange(localCalendar, serverCalendar)) {
          calendarsToUpdate.push(
            updateCalDavCalendar(
              localCalendar.id,
              {
                ...serverCalendar,
              },
              calDavAccount,
              queryRunner
            )
          );

          calendarsChanged = true;
        }

        if (serverCalendar.ctag !== localCalendar.ctag) {
          calendarsWithChangedEvents.push(serverCalendar);
        }
      } else {
        // insert
        calendarsToInsert.push(
          createCalDavCalendar(
            {
              ...serverCalendar,
            },
            calDavAccount,
            queryRunner
          )
        );

        calendarsWithChangedEvents.push(serverCalendar);
        calendarsChanged = true;
      }

      // check deleted local items
      forEach(calDavCalendars, (calDavCalendar: CalendarFromAccount) => {
        const foundItem = find(
          serverCalendars,
          (serverCalendar: DAVCalendar) =>
            serverCalendar.url === calDavCalendar.url
        );

        if (!foundItem) {
          calendarsToDelete.push(calDavCalendar.id);
          calendarsChanged = true;
        }
      });

      if (calendarsToDelete.length > 0) {
        await queryRunner.manager.query(
          `
                  DELETE FROM
                    caldav_calendars 
                  WHERE
                      id = ANY($1)
            `,
          [calendarsToDelete]
        );
      }
    }

    const localCalendars = await Promise.all([
      ...calendarsToInsert,
      ...calendarsToUpdate,
    ]);

    for (const calendar of localCalendars) {
      await updateCalDavEvents(
        calendar,
        client,
        queryRunner,
        calDavAccount.userID
      );
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();

    if (calendarsChanged) {
      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${calDavAccount.userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS })
      );
    }

    if (calendarsWithChangedEvents.length > 0) {
      return true;
    }
  } catch (e) {
    if (queryRunner !== null) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      connection = null;
      queryRunner = null;
      logger.error('Sync caldav events error', e, [
        LOG_TAG.REST,
        LOG_TAG.CALDAV,
      ]);
    }
  }
};

export const syncCalDavEvents = async (userID: string, calDavAccounts: any) => {
  let wasChanged = false;
  for (const calDavAccount of calDavAccounts) {
    const accountWasChanged = await syncEventsForAccount(calDavAccount);

    if (accountWasChanged) {
      wasChanged = true;
    }
  }

  return wasChanged;
};

export const removeSupportedProps = (originalItem: EventJSON) => {
  const item = cloneDeep(originalItem);
  delete item.begin;
  delete item.end;
  delete item.uid;
  delete item.summary;
  delete item.timezone;
  delete item.dtstart;
  delete item.dtend;
  delete item.dtstamp;
  delete item.href;
  delete item.calendarID;
  delete item.location;
  delete item.externalID;
  delete item.etag;
  delete item.color;
  delete item.description;
  delete item.rRule;
  delete item.data;
  delete item.url;

  return item;
};

export const injectMethod = (icalString: string, method: CALENDAR_METHOD) => {
  const firstPart = icalString.slice(0, icalString.indexOf('CALSCALE:'));
  const secondPart = icalString.slice(icalString.indexOf('CALSCALE:') - 1);

  return `${firstPart}METHOD:${method}${secondPart}`;
};

export const formatInviteData = (
  userID: string,
  event: CalDavEventObj | CalDavEventsRaw,
  iCalString: string,
  attendees: any[],
  method: CALENDAR_METHOD
) => {
  return {
    userID,
    email: {
      subject: formatEventInviteSubject(
        event.summary,
        event.startAt,
        event.timezoneStartAt
      ),
      body: formatEventInviteSubject(
        event.summary,
        event.startAt,
        event.timezoneStartAt
      ),
      ical: iCalString,
      method: method,
      // @ts-ignore
      recipients: map(attendees, 'mailto'),
    },
  };
};

export const formatCancelInviteData = (
  userID: string,
  event: CalDavEventsRaw,
  iCalString: string,
  attendees: any[],
  method: CALENDAR_METHOD
) => {
  return {
    userID,
    email: {
      subject: `${formatEventCancelSubject(
        event.summary,
        event.startAt,
        event.timezoneStartAt
      )}`,
      body: formatEventInviteSubject(
        event.summary,
        event.startAt,
        event.timezoneStartAt
      ),
      ical: iCalString,
      method: method,
      // @ts-ignore
      recipients: map(attendees, 'mailto'),
    },
  };
};
