import { ATTENDEE_PARTSTAT } from '../../bloben-interface/enums';
import { Attendee } from '../../bloben-interface/event/event';
import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../utils/enums';
import { Job } from 'bullmq';
import {
  createEventFromCalendarObject,
  formatPartstatResponseData,
  removeMethod,
} from '../../utils/davHelper';
import { emailBullQueue } from '../../service/BullQueue';
import { find } from 'lodash';
import { io } from '../../app';
import { loginToCalDav } from '../../service/davService';
import { removeOrganizerFromAttendees } from '../../api/app/calDavEvent/handlers/createCalDavEvent';
import { throwError } from '../../utils/errorCodes';
import CalDavAccountRepository from '../../data/repository/CalDavAccountRepository';
import CalDavCalendarRepository from '../../data/repository/CalDavCalendarRepository';
import CalDavEventRepository from '../../data/repository/CalDavEventRepository';
import CalendarSettingsRepository from '../../data/repository/CalendarSettingsRepository';
import ICalHelperV2 from '../../utils/ICalHelperV2';
import ICalParser, { EventJSON, ICalJSON } from 'ical-js-parser';
import logger from '../../utils/logger';

export const updatePartstatStatusForAttendee = async (
  attendees: Attendee[],
  userID: string,
  from: string,
  calendarID: string,
  etag: string,
  href: string,
  parstat?: ATTENDEE_PARTSTAT,
  sendInvite?: boolean,
  inviteMessage?: string
): Promise<Attendee[] | null> => {
  if (!attendees?.length) {
    return null;
  }
  // find attendee
  const attendeeNew = find(attendees, (attendee) => attendee.mailto === from);

  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const client = await loginToCalDav(calDavAccount);

  const fetchedEvents = await client.fetchCalendarObjects({
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
    const icalStringNew: string = new ICalHelperV2([eventTemp]).parseTo();

    const response = await client.updateCalendarObject({
      calendarObject: {
        url: href,
        data: icalStringNew,
        etag: fetchedEvents[0].etag,
      },
    });

    if (response.status >= 300) {
      logger.error(
        `Update event PARTSTAT error with status: ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (sendInvite) {
      const icalStringResponse: string = new ICalHelperV2([
        {
          ...eventTemp,
          attendees: [
            { ...attendeeNew, PARTSTAT: parstat || attendeeNew.PARTSTAT },
          ],
          meta: { hideStatus: true, hideSequence: true },
        },
      ]).parseTo();

      await emailBullQueue.add(
        BULL_QUEUE.EMAIL,
        formatPartstatResponseData(
          userID,
          eventTemp,
          parstat,
          icalStringResponse,
          removeOrganizerFromAttendees(
            eventTemp.organizer,
            eventTemp.attendees
          ),
          inviteMessage
        )
      );
    }

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
    );

    return eventTemp.attendees;
  }

  return null;
};

export interface EmailEventJobData extends Job {
  data: {
    icalString: string;
    userID: string;
    from: string;
  };
}
export const processEmailEventJob = async (
  job: EmailEventJobData
): Promise<void> => {
  try {
    const { data } = job;

    if (!data.userID) {
      return;
    }

    // parse to JSON
    const icalJSON: ICalJSON = ICalParser.toJSON(data.icalString);
    const icalEvent: EventJSON = icalJSON.events?.[0];

    // check if event exists and is only response
    const existingEvent: {
      id: string;
      externalID: string;
      calendarID: string;
      attendees: any[];
      href: string;
      etag: string;
    }[] = await CalDavEventRepository.getRepository().query(
      `
      SELECT
        e.id as id,
        e.external_id as "externalID",
        c.id as "calendarID",
        e.attendees as "attendees",
        e.href as "href",
        e.etag as "etag"
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

    if (!existingEvent.length) {
      // TODO in next release
      return;
      let defaultCalDavCalendarID: string;
      // get default calendar and create new event
      const calendarSettings =
        await CalendarSettingsRepository.getRepository().query(
          `
          SELECT
            s.default_calendar_id as "defaultCalendarID"
          FROM calendar_settings s
          INNER JOIN caldav_calendars c ON c.id = s.default_calendar_id
          WHERE 
            s.user_id = $1
            AND s.default_calendar_id IS NOT NULL
            AND c.deleted_at IS NULL
        `,
          [data.userID]
        );

      if (calendarSettings.length) {
        defaultCalDavCalendarID = calendarSettings[0].defaultCalendarID;
      } else {
        const calDavCalendars =
          await CalDavCalendarRepository.getRepository().query(
            `
          SELECT
            c.id as id
          FROM caldav_calendars c
          INNER JOIN caldav_accounts a ON a.id = c.caldav_account_id
          WHERE
            c.deleted_at IS NULL
            AND a.deleted_at IS NULL
            AND a.user_id = $1
            LIMIT 1
        `,
            [data.userID]
          );

        defaultCalDavCalendarID = calDavCalendars[0].id;
      }

      const calDavAccount =
        await CalDavAccountRepository.getByUserIDAndCalendarID(
          data.userID,
          defaultCalDavCalendarID
        );
      const client = await loginToCalDav(calDavAccount);

      await client.createCalendarObject({
        calendar: calDavAccount.calendar,
        filename: `${icalEvent?.uid}.ics`,
        iCalString: removeMethod(data.icalString),
      });
    } else {
      await updatePartstatStatusForAttendee(
        icalEvent.attendee as unknown as Attendee[],
        data.userID,
        data.from,
        existingEvent?.[0]?.calendarID,
        existingEvent?.[0]?.etag,
        existingEvent?.[0]?.href
      );
    }
  } catch (e) {
    logger.error(`Process email event job error`, e, [
      LOG_TAG.CRON,
      LOG_TAG.EMAIL,
    ]);
  }
};
