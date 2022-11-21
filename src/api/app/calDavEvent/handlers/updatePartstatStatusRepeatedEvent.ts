import { Request, Response } from 'express';

import {
  ATTENDEE_PARTSTAT,
  CommonResponse,
  UpdatePartstatStatusRepeatedEventRequest,
} from 'bloben-interface';

import { BULL_QUEUE } from '../../../../utils/enums';
import {
  CalDavEventObj,
  createEventsFromDavObject,
  formatIcalDate,
  formatPartstatResponseData,
  makeDavCall,
} from '../../../../utils/davHelper';
import {
  DavRequestData,
  getDavRequestData,
} from '../../../../utils/davAccountHelper';
import { REPEATED_EVENT_CHANGE_TYPE } from 'bloben-interface/enums';
import {
  calDavSyncBullQueue,
  emailBullQueue,
} from '../../../../service/BullQueue';
import {
  createCommonResponse,
  getUserMailto,
  handleDavResponse,
  isExternalEmailInvite,
} from '../../../../utils/common';
import { fetchCalendarObjects, updateCalendarObject } from 'tsdav';
import { filter, map } from 'lodash';
import { formatEventForPartstatEmailResponse } from '../../../../jobs/queueJobs/processEmailEventJob';
import { formatEventRawToCalDavObj } from '../../../../utils/format';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventExceptionRepository from '../../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../../utils/ICalHelperV2';

/**
 * Update user partstat in all events
 * @param events
 * @param partstat
 * @param userMailto
 */
const formatAllEvents = (
  events: CalDavEventObj[],
  partstat: ATTENDEE_PARTSTAT,
  userMailto: string
): CalDavEventObj[] => {
  return map(events, (event) => {
    return {
      ...event,
      attendees: formatAttendeesSingleEvent(event, partstat, userMailto),
    };
  });
};

/**
 * Set partstat only for user
 * @param event
 * @param partstat
 * @param userMailto
 */
const formatAttendeesSingleEvent = (
  event: CalDavEventsRaw | CalDavEventObj,
  partstat: ATTENDEE_PARTSTAT,
  userMailto: string
) => {
  return map(event.attendees, (item) => {
    if (item.mailto === userMailto) {
      return {
        ...item,
        PARTSTAT: partstat,
      };
    } else {
      return item;
    }
  });
};

/**
 * Change all partstat status for user
 * Set partstat in all existing exceptions
 * Returns calendar objects for creating iCal string
 * @param event
 * @param davRequestData
 * @param calDavAccount
 * @param eventsTemp
 * @param body
 * @param userMailto
 */
const handleChangeAll = async (
  event: CalDavEventsRaw,
  davRequestData: DavRequestData,
  calDavAccount: any,
  eventsTemp: CalDavEventObj[],
  body: UpdatePartstatStatusRepeatedEventRequest,
  userMailto: string
) => {
  const eventObjs = formatAllEvents(eventsTemp, body.status, userMailto);
  const iCalString = new ICalHelperV2(eventObjs).parseTo();

  // create on server
  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };
  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    calDavAccount.calendar.userID,
    event.href
  );

  handleDavResponse(response, 'Update partstat for all events failed');

  return eventObjs;
};

/**
 * Set partstat status for single instance of recurring event
 * If exception does not exist, create new with only user attendee
 * If exception exists, update only exception
 * Returns single calendar object for creating iCal string
 * @param event
 * @param davRequestData
 * @param calDavAccount
 * @param eventsTemp
 * @param body
 * @param userMailto
 * @param userID
 */
const handleChangeSingle = async (
  event: CalDavEventsRaw,
  davRequestData: DavRequestData,
  calDavAccount: any,
  eventsTemp: CalDavEventObj[],
  body: UpdatePartstatStatusRepeatedEventRequest,
  userMailto: string,
  userID: string
) => {
  if (!body.recurrenceID) {
    throw throwError(403, 'Recurrence ID required');
  }

  // check if recurrence exists
  const exception =
    await CalDavEventExceptionRepository.getExceptionByEventIDAndDate(
      userID,
      event.id,
      body.recurrenceID
    );

  const newAttendees = formatAttendeesSingleEvent(
    event,
    body.status,
    userMailto
  );

  let iCalString;
  let iCalObj;

  // create new exception with all attendees from base event
  // and updated partstat for user
  if (!exception) {
    iCalObj = formatEventRawToCalDavObj({
      ...event,
      recurrenceID: body.recurrenceID,
      startAt: body.startAt,
      endAt: body.endAt,
      attendees: newAttendees,
      rRule: undefined,
    });

    iCalString = new ICalHelperV2([...eventsTemp, iCalObj], true).parseTo();

    // send email only if organizer is not current user
  } else {
    const exceptionEvent = await CalDavEventRepository.getCalDavEventByID(
      userID,
      exception.caldavEventID
    );

    iCalObj = formatEventRawToCalDavObj({
      ...exceptionEvent,
      recurrenceID: body.recurrenceID,
      startAt: body.startAt,
      endAt: body.endAt,
      attendees: newAttendees,
      rRule: undefined,
    });

    // remove original recurrence event and replace with updated obj
    iCalString = new ICalHelperV2(
      [
        ...eventsTemp.filter(
          (item) =>
            item.recurrenceID?.value !==
            formatIcalDate(body.recurrenceID.value, body.recurrenceID.timezone)
        ),
        iCalObj,
      ],
      true
    ).parseTo();
  }

  // create on server
  const requestData = {
    headers: davRequestData.davHeaders,
    calendarObject: {
      url: event.href,
      data: iCalString,
      etag: event.etag,
    },
  };

  const response = await makeDavCall(
    updateCalendarObject,
    requestData,
    davRequestData,
    calDavAccount.calendar,
    calDavAccount.calendar.userID,
    event.href
  );

  handleDavResponse(response, 'Update partstat for single event failed');

  return [iCalObj];
};

export const updatePartstatStatusRepeatedEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { eventID } = req.params;

  const body: UpdatePartstatStatusRepeatedEventRequest = req.body;

  const event = await CalDavEventRepository.getCalDavEventByID(userID, eventID);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    event.calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const userMailto = getUserMailto(event);

  const davRequestData = getDavRequestData(calDavAccount);

  // get server events
  const fetchedEvents = await fetchCalendarObjects({
    headers: davRequestData.davHeaders,
    calendar: calDavAccount.calendar,
    objectUrls: [event.href],
  });

  // format to event obj
  const eventsTemp = createEventsFromDavObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  const isEmailInvite = isExternalEmailInvite(event);

  let icalObjForEmail;

  switch (body.type) {
    case REPEATED_EVENT_CHANGE_TYPE.ALL:
      icalObjForEmail = await handleChangeAll(
        event,
        davRequestData,
        calDavAccount,
        eventsTemp,
        body,
        userMailto
      );
      break;
    case REPEATED_EVENT_CHANGE_TYPE.SINGLE:
      icalObjForEmail = await handleChangeSingle(
        event,
        davRequestData,
        calDavAccount,
        eventsTemp,
        body,
        userMailto,
        userID
      );

      break;
  }

  if (body.sendInvite && isEmailInvite) {
    const icalStringResponse: string = new ICalHelperV2(
      map(icalObjForEmail, (item) => {
        const attendees = filter(item.attendees, (attendee) => {
          return attendee.mailto === userMailto;
        });

        return formatEventForPartstatEmailResponse(item, attendees);
      }),
      true
    ).parseTo();

    await emailBullQueue.add(
      BULL_QUEUE.EMAIL,
      formatPartstatResponseData(
        userID,
        event,
        body.status,
        icalStringResponse,
        [event.organizer],
        body.inviteMessage
      )
    );
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('Event partstat status updated');
};
