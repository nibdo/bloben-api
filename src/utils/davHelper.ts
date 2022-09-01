import {
  AccountWithAddressBooks,
  AccountWithCalendars,
  AddressBook,
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
import { RRule } from 'rrule';
import { Range } from 'bloben-interface';
import { cloneDeep, find, forEach, keyBy, map } from 'lodash';
import {
  createCalDavCalendar,
  updateCalDavCalendar,
} from '../api/app/caldavAccount/helpers/createCalDavCalendar';
import { createDavClient } from '../service/davService';
import {
  formatEventCancelSubject,
  formatEventEntityToResult,
  formatEventInviteSubject,
  formatPartstatResponseSubject,
} from './format';
import { formatToRRule, parseEventDuration } from './common';
import { io } from '../app';
import { processCaldavAlarms } from '../api/app/calDavEvent/handlers/updateCalDavEvent';
import { v4 } from 'uuid';
import CalDavCalendarEntity from '../data/entity/CalDavCalendar';
import CalDavEventEntity from '../data/entity/CalDavEventEntity';
import CalDavEventExceptionEntity from '../data/entity/CalDavEventExceptionEntity';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../data/repository/CalDavEventRepository';
import ICalParser, { DateTimeObject, EventJSON } from 'ical-js-parser';
import LuxonHelper from './luxonHelper';

import { ATTENDEE_PARTSTAT } from '../data/types/enums';
import { VcardParsed, parseFromVcardString } from './vcardParser';
import CalendarSettingsRepository from '../data/repository/CalendarSettingsRepository';
import CardDavAddressBook from '../data/entity/CardDavAddressBook';
import CardDavAddressBookRepository from '../data/repository/CardDavAddressBookRepository';
import CardDavContact from '../data/entity/CardDavContact';
import CardDavContactRepository from '../data/repository/CardDavContactRepository';
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
  recurrenceID?: DateTimeObject;
  alarms?: any[];
  organizer?: any;
  attendees?: any[];
  exdates?: DateTimeObject[];
  valarms?: any[];
  rRule: string | null;
  href: string;
  [key: string]: any;
}

export const formatIcalDate = (date: string, timezone?: string | null) => {
  if (!date) {
    return undefined;
  }

  if (timezone) {
    return DateTime.fromISO(date, { zone: timezone }).toFormat(
      `yyyyMMdd'T'HHmmss`
    );
  }

  return date;
};

export const formatDTStartValue = (event: EventJSON, isAllDay: boolean) => {
  let result;

  if (!event?.dtstart?.value) {
    throw Error(`Cannot parse date ${event?.dtstart?.value}`);
  }

  if (isAllDay) {
    const dateTime = DateTime.fromFormat(event.dtstart.value, 'yyyyMMdd');

    if (!dateTime.isValid) {
      throw Error(`Cannot parse date ${event.dtstart.value}`);
    }

    result = dateTime.toISO().toString();
  } else {
    if (event.dtstart.timezone) {
      result = DateTime.fromISO(event.dtstart.value, {
        zone: event.dtstart.timezone,
      })
        .toUTC()
        .toString();
    } else {
      result = event.dtstart.value;
    }
  }

  return result;
};
export const formatDTEndValue = (event: EventJSON, isAllDay: boolean) => {
  let result;

  if (!event?.dtstart?.value) {
    throw Error(`Cannot parse date ${event?.dtstart?.value}`);
  }

  if (!event.dtend?.value) {
    if (event.duration) {
      result = parseEventDuration(
        formatDTStartValue(event, isAllDay),
        event.duration
      );
    } else {
      result = formatDTStartValue(event, isAllDay);
    }
  } else {
    if (isAllDay) {
      const dateTime = DateTime.fromFormat(event.dtend.value, 'yyyyMMdd');

      if (!dateTime.isValid) {
        throw Error(`Cannot parse date ${event.dtend.value}`);
      }

      result = dateTime
        .minus({ day: 1 })
        .set({ hour: 0, minute: 0, second: 0 })
        .toISO()
        .toString();
    } else {
      if (event.dtend.timezone) {
        result = DateTime.fromISO(event.dtend.value, {
          zone: event.dtend.timezone,
        })
          .toUTC()
          .toString();
      } else {
        result = event.dtend.value;
      }
    }
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
    organizer: event.organizer || null,
    location: event.location || null,
    description: event.description || null,
    etag: calendarObject.etag,
    color: event.color || null,
    alarms: event.alarms || [],
    valarms: event.alarms || [],
    exdates: event.exdate || [],
    attendees: event.attendee || [],
    recurrenceID: event.recurrenceId,
    href: calendarObject.url,
    props: removeSupportedProps(event),
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

export const createEventsFromDavObject = (
  calendarObject: DAVCalendarObject,
  calendar: any
) => {
  const result: CalDavEventObj[] = [];
  const icalJS = ICalParser.toJSON(calendarObject.data);
  const events: EventJSON[] = icalJS.events;

  if (icalJS.errors?.length) {
    logger.warn(
      `Parsing event from caldav event string error ${JSON.stringify(
        icalJS.errors
      )}`,
      [LOG_TAG.CRON, LOG_TAG.CALDAV]
    );
  }

  forEach(events, (event) => {
    result.push(formatEventJsonToCalDavEvent(event, calendarObject, calendar));
  });

  return result;
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
      `,
    [calDavCalendar.id]
  );

  const toInsert: string[] = [];
  const toDelete: string[] = [];
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
      toDelete.push(existingEvent.id);
      softDeleteExternalID.push(existingEvent.externalID);
    }
  });

  // delete events
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

  if (toInsert.length > 0 || toDelete.length > 0) {
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
          const eventsTemp = createEventsFromDavObject(item, calDavCalendar);

          forEach(eventsTemp, (eventTemp) => {
            if (eventTemp) {
              const newEvent = new CalDavEventEntity(eventTemp);
              eventsToSync.push(formatEventEntityToResult(newEvent));
              promises.push(queryRunner.manager.save(newEvent));

              if (eventTemp.recurrenceID) {
                const eventException = new CalDavEventExceptionEntity(
                  userID,
                  calDavCalendar.id,
                  eventTemp,
                  eventTemp.recurrenceID,
                  newEvent
                );
                promises.push(queryRunner.manager.save(eventException));
              }

              if (eventTemp.exdates?.length) {
                forEach(eventTemp.exdates, (exDate) => {
                  const eventException = new CalDavEventExceptionEntity(
                    userID,
                    calDavCalendar.id,
                    eventTemp,
                    exDate,
                    newEvent
                  );
                  promises.push(queryRunner.manager.save(eventException));
                });
              }

              if (eventTemp.alarms) {
                promises.push(
                  processCaldavAlarms(
                    queryRunner,
                    eventTemp.alarms,
                    newEvent,
                    userID
                  )
                );
              }
            }
          });
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

export const syncAllCardDav = async (
  userID: string,
  calDavAccounts: AccountWithAddressBooks[]
) => {
  for (const calDavAccount of calDavAccounts) {
    await syncCardDav(calDavAccount);
  }
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
  delete item.rrule;
  delete item.rRule;
  delete item.data;
  delete item.url;
  delete item.attendee;
  delete item.alarms;
  delete item.exdate;
  delete item.organizer;
  delete item.recurrenceId;

  return item;
};

export const injectMethod = (icalString: string, method: CALENDAR_METHOD) => {
  const firstPart = icalString.slice(0, icalString.indexOf('CALSCALE:'));
  const secondPart = icalString.slice(icalString.indexOf('CALSCALE:') - 1);

  return `${firstPart}METHOD:${method}${secondPart}`;
};

export const removeMethod = (icalString: string) => {
  const indexOfMethod = icalString.indexOf('METHOD:');

  if (indexOfMethod === -1) {
    return icalString;
  }

  const firstPart = icalString.slice(0, indexOfMethod);
  const secondPart = icalString.slice(indexOfMethod);
  const indexOfNewLine = secondPart.indexOf('\n');

  return `${firstPart}${secondPart.slice(indexOfNewLine + 1)}`;
};

export const formatPartstatResponseData = (
  userID: string,
  event: CalDavEventObj | CalDavEventsRaw,
  partstat: ATTENDEE_PARTSTAT,
  iCalString: string,
  attendees: any[],
  inviteMessage?: string
) => {
  return {
    userID,
    email: {
      subject: formatPartstatResponseSubject(
        event.summary,
        partstat,
        event.startAt,
        event.timezoneStartAt
      ),
      body: formatEventInviteSubject(
        event.summary,
        event.startAt,
        event.timezoneStartAt,
        inviteMessage
      ),
      ical: injectMethod(iCalString, CALENDAR_METHOD.REPLY),
      method: CALENDAR_METHOD.REPLY,
      // @ts-ignore
      recipients: map(attendees, 'mailto'),
    },
  };
};

export const formatInviteData = (
  userID: string,
  event: CalDavEventObj | CalDavEventsRaw,
  iCalString: string,
  attendees: any[],
  method: CALENDAR_METHOD,
  inviteMessage?: string
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
        event.timezoneStartAt,
        inviteMessage
      ),
      ical: injectMethod(iCalString, method),
      method: method,
      // @ts-ignore
      recipients: map(attendees, 'mailto'),
    },
  };
};

export const formatGeneralEmailData = (
  userID: string,
  recipients: any[],
  subject: string,
  body: string
) => {
  return {
    userID,
    email: {
      subject,
      body,
      recipients,
    },
  };
};

export const formatCancelInviteData = (
  userID: string,
  event: CalDavEventsRaw,
  iCalString: string,
  attendees: any[],
  method: CALENDAR_METHOD,
  inviteMessage?: string
) => {
  return {
    userID,
    email: {
      subject: `${formatEventCancelSubject(
        event.summary,
        (event.startAt as unknown as Date).toISOString(),
        event.timezoneStartAt
      )}`,
      body: formatEventInviteSubject(
        event.summary,
        (event.startAt as unknown as Date).toISOString(),
        event.timezoneStartAt,
        inviteMessage
      ),
      ical: injectMethod(iCalString, method),
      method: method,
      // @ts-ignore
      recipients: map(attendees, 'mailto'),
    },
  };
};

export const formatRecurringCancelInviteData = (
  userID: string,
  event: CalDavEventObj,
  iCalString: string,
  attendees: any[],
  method: CALENDAR_METHOD,
  inviteMessage?: string
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
        event.timezoneStartAt,
        inviteMessage
      ),
      ical: injectMethod(iCalString, method),
      method: method,
      // @ts-ignore
      recipients: map(attendees, 'mailto'),
    },
  };
};

export interface ParsedContact {
  data: VcardParsed;
  etag: string;
  url: string;
}

export const syncCardDav = async (calDavAccount: AccountWithAddressBooks) => {
  const addressBooks: AddressBook[] = calDavAccount.addressBooks;

  const client = createDavClient(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });
  await client.login();

  // fetch address book
  const serverAddressBooks = await client.fetchAddressBooks({
    account: JSON.parse(calDavAccount.data),
  });

  const serverBooksKeyed = keyBy(serverAddressBooks, 'url');
  const localBooksKeyed = keyBy(addressBooks, 'url');

  const promises: any = [];

  for (const item of serverAddressBooks) {
    const existingAddressBook =
      await CardDavAddressBookRepository.findByUserIdAndUrl(
        calDavAccount.userID,
        item.url
      );

    if (!existingAddressBook) {
      const newAddressBook = new CardDavAddressBook(item, calDavAccount.id);
      promises.push(
        CardDavAddressBookRepository.getRepository().save(newAddressBook)
      );
    } else {
      if (existingAddressBook.ctag !== item.ctag) {
        promises.push(
          CardDavAddressBookRepository.getRepository().update(
            existingAddressBook.id,
            {
              url: item.url,
              resourceType: item.resourcetype,
              displayName: item.displayName,
              ctag: item.ctag,
              data: item,
            }
          )
        );
      }
    }
  }

  forEach(localBooksKeyed, (item) => {
    if (!serverBooksKeyed[item.url]) {
      promises.push(
        CardDavAddressBookRepository.getRepository().query(
          `
        DELETE from carddav_address_books WHERE id = $1
      `,
          [item.id]
        )
      );
    }
  });

  await Promise.all(promises);

  // set new default address book id
  if (!addressBooks.length) {
    const newDefaultAddressBook =
      await CardDavAddressBookRepository.findFirstByUserID(
        calDavAccount.userID
      );

    if (newDefaultAddressBook) {
      await CalendarSettingsRepository.getRepository().update(
        calDavAccount.userID,
        {
          defaultAddressBookID: newDefaultAddressBook.id,
        }
      );
    }
  }

  // get vcards
  const addressBooksNew = await CardDavAddressBookRepository.findAllByUserID(
    calDavAccount.userID
  );

  for (const addressBook of addressBooksNew) {
    const vcards = await client.fetchVCards({
      addressBook: addressBook.data,
    });

    const parsedServerContacts: ParsedContact[] = map(vcards, (item) => {
      const parsedResult = parseFromVcardString(item.data);

      return {
        data: parsedResult,
        etag: item.etag,
        url: item.url,
      };
    });

    const existingContacts = await CardDavContactRepository.findByUserIdAndUrls(
      calDavAccount.userID,
      map(parsedServerContacts, 'url')
    );

    // urls
    const toDelete: any[] = [];
    const toInsert: string[] = [];
    const toUpdate: string[] = [];

    const localContactsKeyed = keyBy(existingContacts, 'url');
    const serverContactsKeyed = keyBy(parsedServerContacts, 'url');

    forEach(parsedServerContacts, (serverContact) => {
      // check if exists
      const existingLocalContact = localContactsKeyed[serverContact.url];
      if (existingLocalContact) {
        if (existingLocalContact.etag !== serverContact.etag) {
          toUpdate.push(existingLocalContact.url);
        }
      } else {
        toInsert.push(serverContact.url);
      }
    });

    // check if local is to delete
    forEach(existingContacts, (existingContact) => {
      if (!serverContactsKeyed[existingContact.url]) {
        toDelete.push(existingContact);
      }
    });

    // handle inserts
    const promises: any = [];
    forEach(toInsert, (url) => {
      const item = serverContactsKeyed[url];

      const newContact = new CardDavContact(item, addressBook.id);

      promises.push(CardDavContactRepository.getRepository().save(newContact));
    });

    // handle updates
    forEach(toUpdate, (url) => {
      const item = serverContactsKeyed[url];
      const localItem = localContactsKeyed[url];

      promises.push(
        CardDavContactRepository.getRepository().update(localItem.id, {
          etag: item.etag,
          fullName: item.data?.fullName,
          emails: item.data?.emails,
        })
      );
    });

    // handle deletes
    forEach(toDelete, (item) => {
      promises.push(
        CardDavContactRepository.getRepository().query(
          `
        DELETE FROM carddav_contacts WHERE id = $1`,
          [item.id]
        )
      );
    });

    await Promise.all(promises);
  }
};
