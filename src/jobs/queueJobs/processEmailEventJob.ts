import { ATTENDEE_PARTSTAT } from '../../data/types/enums';
import { Attendee, REPEATED_EVENT_CHANGE_TYPE } from 'bloben-interface';
import { BLOBEN_EVENT_KEY, BULL_QUEUE, LOG_TAG } from '../../utils/enums';
import { CalDavEventObj, removeBlobenMetaData } from '../../utils/davHelper';
import { Job } from 'bullmq';
import { calDavSyncBullQueue } from '../../service/BullQueue';

import { CALENDAR_METHOD } from '../../utils/ICalHelper';
import { DavService } from '../../service/davService';
import { find, uniqBy } from 'lodash';
import { throwError } from '../../utils/errorCodes';
import CalDavEventExceptionRepository from '../../data/repository/CalDavEventExceptionRepository';
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
  to: string,
  icalEvents: EventJSON[],
  data: EmailEventJobData
) => {
  // get email config for user
  const userEmailConfig =
    await UserEmailConfigRepository.findByUserIDAndAddress(userID, to);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error(
      `Calendar for importing email events for address ${to} are not set`
    );
  }

  if (userEmailConfig.calendarForImportID) {
    await DavService.createEventFromEmail(
      icalEvents,
      data,
      userEmailConfig.calendarForImportID
    );

    return { msg: 'Event created' };
  }
};

const handleUpdateEvent = async (
  userID: string,
  to: string,
  existingEvent: CalDavEventsRaw,
  icalEvent: EventJSON,
  data: EmailEventJobData
) => {
  // get email config for user
  const userEmailConfig =
    await UserEmailConfigRepository.findByUserIDAndAddress(userID, to);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error(
      `Calendar for importing email events for address ${to} are not set`
    );
  }

  if (userEmailConfig.calendarForImportID) {
    await DavService.updateEventFromInvite(
      userID,
      existingEvent,
      icalEvent,
      data
    );
  }

  return { msg: 'Event updated' };
};

const handleDeleteEvent = async (
  userID: string,
  to: string,
  existingEvent: CalDavEventsRaw,
  icalEvents: EventJSON[]
) => {
  // get email config for user
  const userEmailConfig =
    await UserEmailConfigRepository.findByUserIDAndAddress(userID, to);

  if (!userEmailConfig?.calendarForImportID) {
    throw Error(
      `Calendar for importing email events for address ${to} are not set`
    );
  }

  if (userEmailConfig.calendarForImportID) {
    for (const event of icalEvents) {
      // normal event
      // repeated event
      if (!event.recurrenceId) {
        await DavService.deleteEvent(
          userID,
          userEmailConfig.calendarForImportID,
          {
            etag: existingEvent.etag,
            href: existingEvent.href,
          }
        );
      } else if (event.recurrenceId) {
        // check exception
        const eventException = icalEvents?.[0]?.recurrenceId;

        const exception =
          await CalDavEventExceptionRepository.getExceptionByExternalEventIDAndDate(
            userID,
            existingEvent.externalID,
            eventException
          );

        if (exception) {
          await DavService.deleteExistingException(
            userID,
            existingEvent.calendarID,
            existingEvent,
            eventException
          );
        } else {
          await DavService.deleteSingleRepeatedEvent(
            userID,
            existingEvent.calendarID,
            existingEvent,
            [eventException]
          );
        }
      }
    }
  }

  return { msg: 'Event deleted' };
};

export const updatePartstatStatusForAttendee = async (
  icalEvents: EventJSON[],
  attendees: Attendee[],
  userID: string,
  from: string,
  calendarID: string,
  etag: string,
  href: string,
  existingEvent: CalDavEventsRaw
) => {
  const attendeeNew = find(
    icalEvents[0].attendee,
    (item) => item.mailto === from
  );
  const status: ATTENDEE_PARTSTAT | undefined =
    attendeeNew?.PARTSTAT as ATTENDEE_PARTSTAT;

  if (!status) {
    throw throwError(409, 'Status for imported event not found');
  }

  const body = {
    endAt: icalEvents[0].dtend.value,
    startAt: icalEvents[0].dtstart.value,
    status,
    type: REPEATED_EVENT_CHANGE_TYPE.ALL,
  };
  if (icalEvents.length > 1 || !icalEvents[0].recurrenceId) {
    await DavService.updatePartstatRepeatedChangeAll(
      userID,
      body,
      existingEvent,
      from
    );
  } else {
    await DavService.updatePartstatSingleRepeated(
      userID,
      existingEvent,
      {
        ...body,
        type: REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        recurrenceID: icalEvents[0].recurrenceId,
      },
      from
    );
  }

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

const checkIfIAMOrganizer = (events: EventJSON[], to: string) => {
  const firstEventOrganizer = events?.[0]?.organizer?.mailto;

  if (!events?.length) {
    throw Error('Missing events for email import');
  }

  if (events.length === 1) {
    return firstEventOrganizer === to;
  }

  // check organizer for all events
  const eventsByUniqueOrganizer = uniqBy(
    events,
    (event) => event?.organizer?.mailto
  );

  if (eventsByUniqueOrganizer.length !== events.length) {
    throw Error('Inconsistency in event organizers');
  }

  return firstEventOrganizer === to;
};

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

    const isAlreadyCanceled =
      !existingEvent && method === CALENDAR_METHOD.CANCEL;
    const iAmOrganizer = checkIfIAMOrganizer(icalEvents, data.to);

    if (!existingEvent && method !== CALENDAR_METHOD.CANCEL && !iAmOrganizer) {
      // event invites
      logger.debug('Creating event from email invite');
      result = await handleCreateNewEvent(
        data.userID,
        data.to,
        icalEvents,
        data
      );
    } else if (isAlreadyCanceled) {
      logger.debug('Skipping cancelling not imported event');
      // skip
      return { msg: 'Event already canceled' };
    } else if (!existingEvent && iAmOrganizer) {
      logger.debug('Skipping event already removed where I am organizer');
      // skip
      return { msg: 'Event not exists' };
    } else {
      // handle external event changes from invite
      if (
        existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_TO] &&
        existingEvent.props?.[BLOBEN_EVENT_KEY.INVITE_FROM]
      ) {
        if (
          (method === CALENDAR_METHOD.REQUEST ||
            method === CALENDAR_METHOD.REPLY) &&
          !iAmOrganizer
        ) {
          logger.debug('Updating existing event from email');
          result = await handleUpdateEvent(
            data.userID,
            data.to,
            existingEvent,
            icalEvents[0],
            data
          );
        } else if (method === CALENDAR_METHOD.CANCEL) {
          logger.debug('Deleting canceled event from email');

          result = await handleDeleteEvent(
            data.userID,
            data.to,
            existingEvent,
            icalEvents
          );
        }
      } else {
        // update status for your event invites
        logger.debug('Updating partstat for event from email');

        result = await updatePartstatStatusForAttendee(
          icalEvents,
          icalEvents?.[0].attendee as unknown as Attendee[],
          data.userID,
          data.from,
          existingEvent?.calendarID,
          existingEvent?.etag,
          existingEvent?.href,
          existingEvent
        );
      }
    }

    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, {
      userID: data.userID,
    });

    return result;
  } catch (e) {
    logger.error(`Process email event job error`, e, [
      LOG_TAG.CRON,
      LOG_TAG.EMAIL,
    ]);

    return { msg: e };
  }
};
