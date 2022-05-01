import { filter, forEach, groupBy, map } from 'lodash';

import { DateTime } from 'luxon';
import { EVENT_TYPE } from '../../../bloben-interface/enums';
import { EventResult } from '../../../bloben-interface/event/event';
import { getOccurrences } from './getRepeatedEvents';
import LuxonHelper from '../../../utils/luxonHelper';
import WebcalEventEntity from '../../../data/entity/WebcalEventEntity';
import WebcalEventExceptionRepository from '../../../data/repository/WebcalEventExceptionRepository';
import WebcalEventRepository from '../../../data/repository/WebcalEventRepository';

export const overlapCondition: string =
  '(we.start_at, we.end_at) OVERLAPS (CAST(:rangeFrom AS timestamp),' +
  ' CAST(:rangeTo AS' +
  ' timestamp))';

export const getWebcalEvents = async (
  userID: string,
  rangeFrom: string,
  rangeTo: string
): Promise<EventResult[]> => {
  let result: any = [];

  const rangeFromDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeFrom as string
  );
  const rangeToDateTime: DateTime = LuxonHelper.parseToDateTime(
    rangeTo as string
  );

  const normalEvents: WebcalEventEntity[] =
    await WebcalEventRepository.getRepository()
      .createQueryBuilder('we')
      .leftJoinAndSelect('we.webcalCalendar', 'wc')
      .addSelect([
        'we.id',
        'we.summary',
        'we.description',
        'we.location',
        'we.sequence',
        'we.organizer',
        'we.attendees',
        'we.allDay',
        'we.isRepeated',
        'we.rRule',
        'we.createdAt',
        'we.updatedAt',
        'we.deletedAt',
        'we.externalID',
      ])
      .where('wc.user_id = :userID', { userID })
      .andWhere('we.isRepeated = false')
      .andWhere(overlapCondition, { rangeFrom, rangeTo })
      .andWhere('we.deletedAt IS NULL')
      .andWhere('wc.isHidden IS FALSE')
      .getMany();

  const repeatedEventsRaw: any =
    await WebcalEventRepository.getRepository().query(
      `SELECT
                we.id as id,
                we.summary as summary,
                we.start_at as "startAt",
                we.end_at as "endAt",
                we.timezone_start_at as "timezoneStartAt",
                we.description as description,
                we.location as location,
                we.sequence as sequence,
                we.organizer as organizer,
                we.attendees as attendees,
                we.all_day as "allDay",
                we.is_repeated as "isRepeated",
                we.r_rule as "rRule",
                we.created_at as "createdAt",
                we.updated_at as "updatedAt",
                we.deleted_at as "deletedAt",
                we.external_id as "externalID",
                wc.id as "calendarID",
                wc.color as color
            FROM 
                webcal_events we
            LEFT JOIN 
                webcal_calendars wc ON we.external_calendar_id = wc.id
            WHERE 
                wc.user_id = $1
                AND we.is_repeated = TRUE 
                AND we.deleted_at IS NULL
                AND wc.is_hidden IS FALSE
                `,
      [userID]
    );

  const exceptions: any =
    await WebcalEventExceptionRepository.getRepository().query(
      `SELECT
                we.exception_date as "exceptionDate",
                we.external_id as "externalID"
            FROM 
                webcal_event_exceptions we
            LEFT JOIN
                webcal_calendars wc ON we.webcal_calendar_id = wc.id
            WHERE 
                wc.user_id = $1 
                AND wc.is_hidden IS FALSE
                AND wc.deleted_at IS NULL
                `,
      [userID]
    );

  const groupedExceptions: any = groupBy(exceptions, 'externalID');

  const groupedRepeatedEvents: any = groupBy(repeatedEventsRaw, 'id');

  const repeatedEvents: any = [];

  forEach(groupedRepeatedEvents, (eventResult) => {
    const event: any = {};

    forEach(eventResult, (item) => {
      // store only first main item
      if (!event.id) {
        (event.id = item.id),
          (event.summary = item.summary),
          (event.description = item.description),
          (event.location = item.location),
          (event.sequence = item.sequence),
          (event.organizer = item.organizer),
          (event.attendees = item.attendees),
          (event.allDay = item.allDay),
          (event.isRepeated = item.isRepeated),
          (event.rRule = item.rRule),
          (event.createdAt = item.createdAt),
          (event.updatedAt = item.updatedAt),
          (event.deletedAt = item.deletedAt),
          (event.externalID = item.externalID),
          (event.startAt = item.startAt),
          (event.endAt = item.endAt),
          (event.timezoneEndAt = item.timezoneStartAt),
          (event.timezoneStartAt = item.timezoneStartAt),
          (event.webcalCalendar = {
            id: item.calendarID,
            color: item.color,
          });
      }
    });

    repeatedEvents.push(event);
  });

  let repeatedEventsResult: WebcalEventEntity[] = [];

  // process exceptions
  forEach(repeatedEvents, (event) => {
    const eventExceptions = groupedExceptions[event.externalID];
    const eventExceptionDates = map(eventExceptions, (exception) =>
      exception.exceptionDate?.toISOString()
    );

    let repeatedEvents = getOccurrences(
      event,
      rangeFromDateTime,
      rangeToDateTime
    );

    // remove dates colliding with exceptions
    if (eventExceptions && eventExceptions.length) {
      repeatedEvents = filter(repeatedEvents, (event) => {
        if (!eventExceptionDates.includes(event.startAt.toISOString())) {
          return event;
        }
      });
    }

    repeatedEventsResult = [...repeatedEventsResult, ...repeatedEvents];
  });

  result = [...result, ...normalEvents, ...repeatedEventsResult];

  return map(result, (event) => ({
    id: event.id,
    externalID: event.externalID,
    internalID: event.internalID,
    summary: event.summary,
    description: event.description,
    location: event.location,
    sequence: event.sequence,
    organizer: event.organizer,
    attendees: event.attendees,
    alarms: [],
    props: null,
    // alarms: event.alarms ? event.alarms : [],
    allDay: event.allDay,
    calendarID: event.webcalCalendar.id,
    color: event.webcalCalendar.color,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    timezoneEndAt: event.timezoneStartAt,
    timezoneStartAt: event.timezoneStartAt,
    isRepeated: event.isRepeated,
    rRule: event.rRule,
    type: EVENT_TYPE.WEBCAL,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    deletedAt: event.deletedAt?.toISOString(),
  }));
};
