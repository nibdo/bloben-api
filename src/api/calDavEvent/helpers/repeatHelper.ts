import { DateTime } from 'luxon';
import { cloneDeep, forEach } from 'lodash';
import { formatToRRule } from '../../../utils/common';
import { v4 } from 'uuid';
import LuxonHelper from '../../../utils/luxonHelper';
import RRule from 'rrule';
import WebcalEventEntity from '../../../data/entity/WebcalEventEntity';

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

export const getRepeatedEvents = (
  event: WebcalEventEntity | any,
  rangeFromDateTime: DateTime,
  rangeToDateTime: DateTime
) => {
  const result: any = [];

  const startAtISO =
    typeof event.startAt === 'string'
      ? event.startAt
      : event.startAt.toISOString();
  const endAtISO =
    typeof event.endAt === 'string' ? event.endAt : event.endAt.toISOString();

  const startAtDate = DateTime.fromISO(startAtISO).toUTC().toString();
  const endAtDate = DateTime.fromISO(endAtISO).toUTC().toString();

  const rRule = RRule.fromString(formatToRRule(event.rRule, startAtISO));

  const diffInMinutes: number = LuxonHelper.getDiffInMinutes2(
    startAtDate,
    endAtDate
  );

  // check if event starts in DST
  const eventStartsInDST: boolean = DateTime.fromISO(startAtDate).setZone(
    event.timezoneStart
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
      event.timezoneStart
    ).isInDST;

    // set proper "wall" time for repeated dates across DST changes
    if (!eventStartsInDST && repeatedEventStartsInDST) {
      startAtDateTime = startAtDateTime.minus({ hours: 1 });
    }

    if (eventStartsInDST && !repeatedEventStartsInDST) {
      startAtDateTime = startAtDateTime.plus({ hours: 1 });
    }

    eventClone.internalID = v4();
    eventClone.startAt = startAtDateTime.toJSDate();
    eventClone.endAt = LuxonHelper.addMinutes(
      startAtDateTime.toString(),
      diffInMinutes
    ).toJSDate();

    if (!isException(rRuleResult, event)) {
      result.push(eventClone);
    }
  });

  return result;
};
