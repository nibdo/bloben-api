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
  makeDavCall,
  removeBlobenMetaData,
} from '../../utils/davHelper';
import { Job } from 'bullmq';
import { calDavSyncBullQueue } from '../../service/BullQueue';
import { deleteCalendarObject } from 'tsdav';
import { getDavRequestData } from '../../utils/davAccountHelper';
import { io } from '../../app';

import { CALENDAR_METHOD } from '../../utils/ICalHelper';
import { DavService } from '../../service/davService';
import { EventProps } from '../../common/interface/common';
import { InviteService } from '../../service/InviteService';
import CalDavAccountRepository from '../../data/repository/CalDavAccountRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../../data/repository/CalDavEventRepository';
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
  icalEvents: EventJSON[],
  data: EmailEventJobData
) => {
  // get email config for user
  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error('Calendar for importing email events not set');
  }

  if (userEmailConfig.calendarForImportID) {
    await DavService.createEventFromEmail(
      icalEvents,
      data,
      userEmailConfig.calendarForImportID
    );

    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

    return { msg: 'Event created' };
  }
};

const handleUpdateEvent = async (
  userID: string,
  existingEvent: CalDavEventsRaw,
  icalEvent: EventJSON,
  data: EmailEventJobData
) => {
  // get email config for user
  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error('Calendar for importing email events not set');
  }

  if (userEmailConfig.calendarForImportID) {
    await DavService.updateEventFromInvite(
      userID,
      existingEvent,
      icalEvent,
      data
    );

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

    const requestData = {
      headers: davHeaders,
      calendarObject: {
        url: existingEvent.href,
        etag: existingEvent.etag,
      },
    };
    const response = await makeDavCall(
      deleteCalendarObject,
      requestData,
      davRequestData,
      calDavAccount.calendar,
      calDavAccount.calendar.userID,
      existingEvent.href
    );

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
  existingEvent: CalDavEventsRaw,
  partstat?: ATTENDEE_PARTSTAT,
  sendInvite?: boolean,
  inviteMessage?: string,
  to?: string
) => {
  const { eventTemp, attendeeNew } = await DavService.updatePartstat(
    userID,
    existingEvent.calendarID,
    existingEvent,
    existingEvent.attendees,
    existingEvent.organizer.mailto,
    partstat,
    existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_TO] || to
  );

  if (sendInvite) {
    await InviteService.changePartstatStatus(
      eventTemp,
      userID,
      attendeeNew,
      partstat,
      inviteMessage
    );
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return { attendeeNew, msg: 'Partstat updated' };
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
    let result = { msg: 'Unknown' };

    const { data } = job;

    if (!data.userID) {
      return;
    }

    // parse to JSON
    const icalJSON: ICalJSON = ICalParser.toJSON(data.icalString);
    const icalEvents = icalJSON.events;

    if (!icalEvents?.length || icalJSON.errors?.length) {
      logger.error(
        `Error while parsing event from email`,
        { event: data.icalString, errors: icalJSON.errors },
        [LOG_TAG.CRON, LOG_TAG.EMAIL]
      );

      throw Error('Error while parsing event from email');
    }

    // check if event exists and is only response
    const existingEvent = await CalDavEventRepository.getEventByExternalID(
      data.userID,
      icalEvents?.[0]?.uid
    );

    const { method } = icalJSON.calendar;

    if (!existingEvent && method !== CALENDAR_METHOD.CANCEL) {
      // event invites
      result = await handleCreateNewEvent(data.userID, icalEvents, data);
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
            icalEvents[0],
            data
          );
        } else if (method === CALENDAR_METHOD.CANCEL) {
          result = await handleDeleteEvent(data.userID, existingEvent);
        }
      } else {
        // update status for your event invites
        for (const icalEvent of icalEvents) {
          result = await updatePartstatStatusForAttendee(
            icalEvent.attendee as unknown as Attendee[],
            data.userID,
            data.from,
            existingEvent?.calendarID,
            existingEvent?.etag,
            existingEvent?.href,
            existingEvent
          );
        }
      }
    }

    return result;
  } catch (e) {
    logger.error(`Process email event job error`, e, [
      LOG_TAG.CRON,
      LOG_TAG.EMAIL,
    ]);

    return { msg: e };
  }
};
