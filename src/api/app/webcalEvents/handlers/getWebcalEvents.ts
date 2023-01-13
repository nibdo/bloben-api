import { Request, Response } from 'express';
import { forEach, groupBy, map } from 'lodash';

import { DateTime } from 'luxon';
import { EVENT_TYPE, EventResult } from 'bloben-interface';
import { SOURCE_TYPE } from '../../../../data/types/enums';
import { getOccurrences } from '../../event/helpers/getRepeatedEvents';
import LuxonHelper from '../../../../utils/luxonHelper';
import WebcalEventEntity from '../../../../data/entity/WebcalEventEntity';
import WebcalEventRepository from '../../../../data/repository/WebcalEventRepository';

export const overlapCondition = `(we.start_at BETWEEN CAST(:rangeFrom AS timestamp) AND CAST(:rangeTo AS timestamp) OR we.end_at BETWEEN CAST(:rangeFrom AS timestamp) AND CAST(:rangeTo AS timestamp)
`;

export const getWebcalEvents = async (
  req: Request,
  res: Response
): Promise<EventResult[]> => {
  const { userID } = res.locals;
  const { rangeFrom, rangeTo } = req.query;

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
      .getMany();

  const repeatedEventsRaw = await WebcalEventRepository.getRepository().query(
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
                wc.color as color,
                wee.exception_date as "exceptionDate",
                wee.exception_timezone as "exceptionTimezone"
            FROM 
                webcal_events we
            LEFT JOIN 
                webcal_calendars wc ON we.external_calendar_id = wc.id
            LEFT JOIN
                webcal_event_exceptions wee ON wee.external_id = we.external_id AND wee.user_id = wc.user_id
            WHERE 
                wc.user_id = $1 AND 
                we.is_repeated = TRUE AND 
                we.deleted_at IS NULL
                `,
    [userID]
  );

  const groupedRepeatedEvents: any = groupBy(repeatedEventsRaw, 'id');

  const repeatedEvents: any = [];

  forEach(groupedRepeatedEvents, (eventResult) => {
    const exceptions: any = [];
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

      if (item.exceptionDate) {
        exceptions.push(item.exceptionDate);
      }
    });

    event.exceptions = exceptions;

    repeatedEvents.push(event);
  });

  let repeatedEventsResult: WebcalEventEntity[] = [];

  forEach(repeatedEvents, (event) => {
    const repeatedEvents = getOccurrences(
      event,
      rangeFromDateTime,
      rangeToDateTime
    );

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
    sourceType: SOURCE_TYPE.WEBCAL,
    type: EVENT_TYPE.EVENT,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    deletedAt: event.deletedAt?.toISOString(),
  }));
};
