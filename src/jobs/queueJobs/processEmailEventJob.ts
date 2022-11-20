import { ATTENDEE_PARTSTAT } from '../../data/types/enums';
import { Attendee } from 'bloben-interface';
import {
  BLOBEN_EVENT_KEY,
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import {
  CalDavEventObj,
  createEventFromCalendarObject,
  formatEventJsonToCalDavEvent,
  formatPartstatResponseData,
  removeBlobenMetaData,
  removeMethod,
} from '../../utils/davHelper';
import { Job } from 'bullmq';
import { calDavSyncBullQueue, emailBullQueue } from '../../service/BullQueue';
import {
  createCalendarObject,
  deleteCalendarObject,
  fetchCalendarObjects,
  updateCalendarObject,
} from 'tsdav';
import { find } from 'lodash';
import { getDavRequestData } from '../../utils/davAccountHelper';
import { io } from '../../app';

import { CALENDAR_METHOD } from '../../utils/ICalHelper';
import { EventProps } from '../../common/interface/common';
import { getOneResult } from '../../utils/common';
import { throwError } from '../../utils/errorCodes';
import CalDavAccountRepository from '../../data/repository/CalDavAccountRepository';
import CalDavEventRepository from '../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../utils/ICalHelperV2';
import ICalParser, { EventJSON, ICalJSON } from 'ical-js-parser';
import UserEmailConfigRepository from '../../data/repository/UserEmailConfigRepository';
import logger from '../../utils/logger';

/**
 * Remove bloben meta data and force keeping sequence
 * @param eventTemp
 * @param attendees
 */
export const formatEventForPartstatEmailResponse = (
  eventTemp: CalDavEventObj,
  attendees: Attendee[]
) => ({
  ...removeBlobenMetaData(eventTemp),
  meta: { hideStatus: true, hideSequence: true },
  attendees,
});

const handleCreateNewEvent = async (
  userID: string,
  icalEvent: EventJSON,
  data: EmailEventJobData
) => {
  // get email config for user
  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error('Calendar for importing email events not set');
  }

  if (userEmailConfig.calendarForImportID) {
    const calDavAccount =
      await CalDavAccountRepository.getByUserIDAndCalendarID(
        userID,
        userEmailConfig.calendarForImportID
      );
    const davRequestData = getDavRequestData(calDavAccount);
    const { davHeaders } = davRequestData;

    const eventObj = formatEventJsonToCalDavEvent(
      icalEvent,
      {
        etag: undefined,
        url: undefined,
      },
      calDavAccount.calendar
    );

    // add metadata to event
    eventObj.props[BLOBEN_EVENT_KEY.INVITE_TO] = data.to;
    eventObj.props[BLOBEN_EVENT_KEY.INVITE_FROM] = data.from;
    eventObj.props[BLOBEN_EVENT_KEY.ORIGINAL_SEQUENCE] =
      eventObj.props?.sequence;

    const icalStringNew: string = new ICalHelperV2([eventObj], true).parseTo();

    const response = await createCalendarObject({
      headers: davHeaders,
      calendar: calDavAccount.calendar,
      filename: `${icalEvent?.uid}.ics`,
      iCalString: removeMethod(icalStringNew),
    });

    if (response.status >= 300) {
      logger.error(
        `Create event from email error with status: ${response.status} ${response.statusText}`,
        { icalEvent }
      );
      return null;
    }

    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

    return { msg: 'Event created' };
  }
};

const handleUpdateEvent = async (
  userID: string,
  existingEvent: ExistingEvent,
  icalEvent: EventJSON,
  data: EmailEventJobData
) => {
  // get email config for user
  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error('Calendar for importing email events not set');
  }

  if (userEmailConfig.calendarForImportID) {
    const calDavAccount =
      await CalDavAccountRepository.getByUserIDAndCalendarID(
        userID,
        userEmailConfig.calendarForImportID
      );
    const davRequestData = getDavRequestData(calDavAccount);
    const { davHeaders } = davRequestData;

    const eventObj = formatEventJsonToCalDavEvent(
      icalEvent,
      {
        etag: existingEvent.etag,
        url: existingEvent.href,
      },
      calDavAccount.calendar
    );

    // add metadata to event
    eventObj.props[BLOBEN_EVENT_KEY.INVITE_TO] = data.to;
    eventObj.props[BLOBEN_EVENT_KEY.INVITE_FROM] = data.from;
    eventObj.props[BLOBEN_EVENT_KEY.ORIGINAL_SEQUENCE] =
      eventObj.props?.sequence;

    const icalStringNew: string = new ICalHelperV2([eventObj], true).parseTo();

    const response = await updateCalendarObject({
      headers: davHeaders,
      calendarObject: {
        url: existingEvent.href,
        data: removeMethod(icalStringNew),
        etag: existingEvent.etag,
      },
    });

    if (response.status >= 300) {
      logger.error(
        `Update event from email error with status: ${response.status} ${response.statusText}`,
        { icalEvent }
      );
      return null;
    }

    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });
  }

  return { msg: 'Event updated' };
};

const handleDeleteEvent = async (
  userID: string,
  existingEvent: ExistingEvent
) => {
  // get email config for user
  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error('Calendar for importing email events not set');
  }

  if (userEmailConfig.calendarForImportID) {
    const calDavAccount =
      await CalDavAccountRepository.getByUserIDAndCalendarID(
        userID,
        userEmailConfig.calendarForImportID
      );
    const davRequestData = getDavRequestData(calDavAccount);
    const { davHeaders } = davRequestData;

    const response = await deleteCalendarObject({
      headers: davHeaders,
      calendarObject: {
        url: existingEvent.href,
        etag: existingEvent.etag,
      },
    });

    if (response.status >= 300) {
      logger.error(
        `Delete event from email error with status: ${response.status} ${response.statusText}`,
        { existingEvent }
      );
      return null;
    }

    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });
  }

  return { msg: 'Event deleted' };
};

export const updatePartstatStatusForAttendee = async (
  attendees: Attendee[],
  userID: string,
  from: string,
  calendarID: string,
  etag: string,
  href: string,
  parstat?: ATTENDEE_PARTSTAT,
  sendInvite?: boolean,
  inviteMessage?: string,
  to?: string
): Promise<Attendee[] | null> => {
  if (!attendees?.length) {
    return null;
  }
  // find attendee
  const attendeeNew = find(attendees, (attendee) => {
    if (to) {
      return attendee.mailto === to;
    } else {
      return attendee.mailto === from;
    }
  });

  if (!attendeeNew) {
    return;
  }

  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  const fetchedEvents = await fetchCalendarObjects({
    headers: davHeaders,
    calendar: calDavAccount.calendar,
    objectUrls: [href],
  });

  const eventTemp = createEventFromCalendarObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  if (eventTemp?.attendees?.length) {
    eventTemp.attendees = eventTemp.attendees.map((item) => {
      if (item.mailto === attendeeNew.mailto) {
        return {
          ...item,
          PARTSTAT: parstat || attendeeNew.PARTSTAT,
        };
      } else {
        return item;
      }
    });
    const icalStringNew: string = new ICalHelperV2([eventTemp], true).parseTo();

    const response = await updateCalendarObject({
      headers: davHeaders,
      calendarObject: {
        url: href,
        data: icalStringNew,
        etag: fetchedEvents[0].etag,
      },
    });

    if (response.status >= 300) {
      logger.error(
        `Update event PARTSTAT error with status: ${response.status} ${response.statusText}`,
        { href, etag }
      );
      return null;
    }

    if (sendInvite) {
      const icalStringResponse: string = new ICalHelperV2(
        [
          formatEventForPartstatEmailResponse(eventTemp, [
            { ...attendeeNew, PARTSTAT: parstat || attendeeNew.PARTSTAT },
          ]),
        ],
        true
      ).parseTo();

      // send email only to organizer
      if (attendeeNew.mailto !== eventTemp.organizer.mailto) {
        await emailBullQueue.add(
          BULL_QUEUE.EMAIL,
          formatPartstatResponseData(
            userID,
            eventTemp,
            parstat,
            icalStringResponse,
            [eventTemp.organizer],
            inviteMessage
          )
        );
      }
    }

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
    );

    return eventTemp.attendees;
  }

  return null;
};

export interface EmailEventJobData {
  icalString: string;
  userID: string;
  from: string;
  to: string;
}

export interface EmailEventJob extends Job {
  data: EmailEventJobData;
}

interface ExistingEvent {
  id: string;
  externalID: string;
  calendarID: string;
  attendees: any[];
  href: string;
  etag: string;
  props: EventProps;
}
export const processEmailEventJob = async (
  job: EmailEventJob
): Promise<any> => {
  try {
    let result;

    const { data } = job;

    if (!data.userID) {
      return;
    }

    // parse to JSON
    const icalJSON: ICalJSON = ICalParser.toJSON(data.icalString);
    const icalEvent: EventJSON = icalJSON.events?.[0];

    if (!icalEvent || icalJSON.errors?.length) {
      logger.error(
        `Error while parsing event from email`,
        { event: data.icalString, errors: icalJSON.errors },
        [LOG_TAG.CRON, LOG_TAG.EMAIL]
      );

      throw Error('Error while parsing event from email');
    }

    // check if event exists and is only response
    const existingEvents: ExistingEvent[] =
      await CalDavEventRepository.getRepository().query(
        `
      SELECT
        e.id as id,
        e.external_id as "externalID",
        c.id as "calendarID",
        e.attendees as "attendees",
        e.href as "href",
        e.etag as "etag",
        e.props as "props"
      FROM caldav_events e
      INNER JOIN caldav_calendars c ON c.id = e.caldav_calendar_id
      INNER JOIN caldav_accounts a on a.id = c.caldav_account_id
      WHERE 
        c.deleted_at IS NULL
        AND a.deleted_at IS NULL  
        AND a.user_id = $1
        AND e.external_id = $2
    `,
        [data.userID, icalEvent?.uid]
      );

    const existingEvent: ExistingEvent = getOneResult(existingEvents);

    const { method } = icalJSON.calendar;

    if (!existingEvent && method !== CALENDAR_METHOD.CANCEL) {
      // event invites
      result = await handleCreateNewEvent(data.userID, icalEvent, data);
    } else if (!existingEvent && method === CALENDAR_METHOD.CANCEL) {
      // skip
      return { msg: 'Event not exists' };
    } else {
      // handle external event changes from invite
      if (
        existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_TO] &&
        existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_FROM]
      ) {
        if (
          method === CALENDAR_METHOD.REQUEST ||
          method === CALENDAR_METHOD.REPLY
        ) {
          result = await handleUpdateEvent(
            data.userID,
            existingEvent,
            icalEvent,
            data
          );
        } else if (method === CALENDAR_METHOD.CANCEL) {
          result = await handleDeleteEvent(data.userID, existingEvent);
        }
      } else {
        // update status for your event invites
        result = await updatePartstatStatusForAttendee(
          icalEvent.attendee as unknown as Attendee[],
          data.userID,
          data.from,
          existingEvent?.calendarID,
          existingEvent?.etag,
          existingEvent?.href
        );
      }
    }

    return result;
  } catch (e) {
    logger.error(`Process email event job error`, e, [
      LOG_TAG.CRON,
      LOG_TAG.EMAIL,
    ]);
  }
};
