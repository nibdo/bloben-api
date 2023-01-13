import { DateTime } from 'luxon';
import { RRule } from 'rrule';
import { cloneDeep, find, forEach, groupBy, map, uniq } from 'lodash';
import { formatToRRule } from '../../../../utils/common';
import { v4 } from 'uuid';
import CalDavEventEntity from '../../../../data/entity/CalDavEventEntity';
import CalDavEventExceptionRepository from '../../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../../../../data/repository/CalDavEventRepository';
import Datez from 'datez';
import LuxonHelper from '../../../../utils/luxonHelper';
import WebcalEventEntity from '../../../../data/entity/WebcalEventEntity';

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

export const getOccurrences = (
  event: CalDavEventEntity | WebcalEventEntity | any,
  rangeFromDateTime: DateTime,
  rangeToDateTime: DateTime
) => {
  const result: any = [];

  let endAtISO;
  let endAtDate;

  if (!event.startAt) {
    return [];
  }

  const startAtISO =
    typeof event.startAt === 'string'
      ? event.startAt
      : event.startAt.toISOString();

  if (event.endAt) {
    endAtISO =
      typeof event.endAt === 'string' ? event.endAt : event.endAt.toISOString();
  }

  const startAtDate = DateTime.fromISO(startAtISO, { zone: 'UTC' }).toString();

  if (endAtISO) {
    endAtDate = DateTime.fromISO(endAtISO, { zone: 'UTC' }).toString();
  } else {
    endAtDate = DateTime.fromISO(startAtISO, { zone: 'UTC' })
      .plus({ minutes: 30 })
      .toString();
  }

  const rRule = RRule.fromString(formatToRRule(event.rRule, startAtISO));

  const diffInMinutes: number = LuxonHelper.getDiffInMinutes2(
    startAtDate,
    endAtDate
  );

  // check if event starts in DST
  const eventStartsInDST: boolean = Datez.setZone(
    DateTime.fromISO(startAtDate),
    event.timezoneStartAt
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
    const repeatedEventStartsInDST: boolean = Datez.setZone(
      startAtDateTime,
      event.timezoneStartAt
    ).isInDST;

    // set proper "wall" time for repeated dates across DST changes
    if (!eventStartsInDST && repeatedEventStartsInDST) {
      startAtDateTime = startAtDateTime.minus({ hours: 1 });
    }

    if (eventStartsInDST && !repeatedEventStartsInDST) {
      startAtDateTime = startAtDateTime.plus({ hours: 1 });
    }

    eventClone.internalID = v4();
    eventClone.startAt = startAtDateTime.toString();

    eventClone.endAt = LuxonHelper.addMinutes(
      startAtDateTime.toString(),
      diffInMinutes
    ).toString();

    if (!isException(rRuleResult, event)) {
      result.push(eventClone);
    }
  });

  return result;
};

export const getRepeatedEvents = async (
  userID: string | null,
  rangeFromDateTime: DateTime,
  rangeToDateTime: DateTime,
  sharedIDs?: string[],
  showTasks?: boolean
) => {
  let repeatedEventEntities: CalDavEventsRaw[] = [];

  if (userID) {
    repeatedEventEntities = await CalDavEventRepository.getRepeatedEvents(
      userID,
      showTasks
    );
  } else if (sharedIDs) {
    repeatedEventEntities = await CalDavEventRepository.getPublicRepeatedEvents(
      sharedIDs,
      showTasks
    );
  }

  let repeatedEventsResult = [];

  forEach(repeatedEventEntities, (event) => {
    const occurrences = getOccurrences(
      event,
      rangeFromDateTime,
      rangeToDateTime
    );

    repeatedEventsResult = [...repeatedEventsResult, ...occurrences];
  });

  // get exceptions
  const repeatedExternalIDs = uniq(map(repeatedEventsResult, 'externalID'));
  const exceptions = await CalDavEventExceptionRepository.getExceptions(
    userID,
    repeatedExternalIDs
  );

  const exceptionsGrouped = groupBy(exceptions, 'externalID');

  // filter exceptions from result
  repeatedEventsResult = repeatedEventsResult.filter((repeatedEvent) => {
    const repeatedEventExceptions = exceptionsGrouped[repeatedEvent.externalID];

    if (repeatedEventExceptions?.length) {
      // check if it is exceptions
      const hasExceptions = find(
        repeatedEventExceptions,
        (item) => item.exceptionDate === repeatedEvent.startAt
      );
      if (!hasExceptions) {
        return repeatedEvent;
      }
    } else {
      return repeatedEvent;
    }
  });

  return repeatedEventsResult;
};
