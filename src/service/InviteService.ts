import { ATTENDEE_PARTSTAT } from '../data/types/enums';
import { Attendee } from 'bloben-interface';
import { BLOBEN_EVENT_KEY } from '../utils/enums';
import {
  CalDavEventObj,
  formatPartstatResponseData,
  formatRecurringCancelInviteData,
  injectMethod,
  removeBlobenMetaData,
} from '../utils/davHelper';
import { CalDavEventsRaw } from '../data/repository/CalDavEventRepository';
import { DateTimeObject } from 'ical-js-parser';
import { QueueClient } from './init';
import {
  formatEventCancelSubject,
  formatEventInviteSubject,
  formatEventRawToCalDavObj,
} from '../utils/format';
import { formatEventForPartstatEmailResponse } from '../jobs/queueJobs/processEmailEventJob';
import { removeOrganizerFromAttendees } from '../api/app/calDavEvent/handlers/createCalDavEvent';
import ICalHelper, { CALENDAR_METHOD } from '../utils/ICalHelper';
import ICalHelperV2 from '../utils/ICalHelperV2';

const createICalStringForAttendees = (data: CalDavEventObj) => {
  if (data?.attendees?.length) {
    return new ICalHelperV2([data]).parseTo();
  }
};

const formatInviteData = (
  userID: string,
  event: CalDavEventObj | CalDavEventsRaw,
  iCalString: string,
  attendees: string[],
  method: CALENDAR_METHOD,
  inviteMessage?: string
) => {
  return {
    userID,
    from: event.organizer.mailto,
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
      recipients: attendees,
    },
  };
};

const createEvent = async (
  event: CalDavEventObj,
  userID: string,
  iCalString: string,
  inviteMessage?: string
) => {
  const inviteData = formatInviteData(
    userID,
    event,
    iCalString,
    removeOrganizerFromAttendees(event.organizer, event.attendees),
    CALENDAR_METHOD.REQUEST,
    inviteMessage
  );

  await QueueClient.sendEmailQueue(inviteData);
};

const formatCancelInviteData = (
  userID: string,
  event: CalDavEventsRaw,
  iCalString: string,
  attendees: string[],
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
      ical: iCalString,
      method: method,
      recipients: attendees,
    },
  };
};

const cancelNormalEventAsOrganizer = async (
  event: CalDavEventsRaw,
  userID: string,
  addresses: string[],
  inviteMessage?: string
) => {
  const iCalString = new ICalHelper(event).parseTo(CALENDAR_METHOD.CANCEL);

  const inviteData = formatCancelInviteData(
    userID,
    event,
    iCalString,
    addresses,
    CALENDAR_METHOD.CANCEL,
    inviteMessage
  );

  await QueueClient.sendEmailQueue(inviteData);
};

const cancelNormalEventAsGuest = async (
  event: CalDavEventsRaw,
  userID: string,
  inviteMessage?: string
) => {
  const attendeesNew = event.attendees
    .map((item) => {
      if (item.mailto === event.props[BLOBEN_EVENT_KEY.INVITE_TO]) {
        return {
          ...item,
          PARTSTAT: ATTENDEE_PARTSTAT.DECLINED,
        };
      } else {
        return item;
      }
    })
    .filter((item) => item.mailto === event.props[BLOBEN_EVENT_KEY.INVITE_TO]);

  if (!attendeesNew.length) {
    return;
  }

  event.attendees = attendeesNew;

  const calDavEventObj = formatEventRawToCalDavObj(event);

  const icalStringResponse: string = new ICalHelperV2(
    [
      {
        ...removeBlobenMetaData(calDavEventObj),
        attendees: attendeesNew,
        meta: { hideStatus: true, hideSequence: true },
      },
    ],
    true
  ).parseTo();

  await QueueClient.sendEmailQueue(
    formatPartstatResponseData(
      userID,
      event,
      ATTENDEE_PARTSTAT.DECLINED,
      icalStringResponse,
      [event.organizer.mailto],
      inviteMessage
    )
  );
};

/**
 * Will send cancel event email to removed attendees and update event email
 * to reminding attendees
 *
 * Handle:
 * - updating normal event
 * - updating repeated event - change all instances
 * - removing some attendees and adding some new
 * - switching from repeated event to normal event
 * @param eventPrev
 * @param eventNew
 * @param userID
 * @param iCalString
 * @param inviteMessage
 */
const updateNormalEvent = async (
  eventPrev: CalDavEventsRaw,
  eventNew: CalDavEventObj,
  userID: string,
  iCalString: string,
  inviteMessage: string
) => {
  const attendeesNew = removeOrganizerFromAttendees(
    eventNew.organizer,
    eventNew.attendees
  );

  // get attendees not included in updated event
  const attendeesPrev = removeOrganizerFromAttendees(
    eventPrev.organizer,
    eventPrev.attendees
  ).filter((item) => {
    if (!attendeesNew.includes(item)) {
      return item;
    }
  });

  // send invite to new attendees
  if (attendeesNew?.length) {
    await QueueClient.sendEmailQueue(
      formatInviteData(
        userID,
        eventNew,
        iCalString,
        attendeesNew,
        CALENDAR_METHOD.REQUEST,
        inviteMessage
      )
    );
  }

  // cancel event for removed attendees
  if (attendeesPrev?.length) {
    const iCalString = new ICalHelper(eventPrev).parseTo(
      CALENDAR_METHOD.CANCEL
    );

    const inviteData = formatCancelInviteData(
      userID,
      eventPrev,
      iCalString,
      attendeesPrev,
      CALENDAR_METHOD.CANCEL
    );

    await QueueClient.sendEmailQueue(inviteData);
  }
};

const cancelSingleRepeatedEventAsOrganizer = async (
  event: CalDavEventObj,
  recurrenceID: DateTimeObject,
  userID: string,
  inviteMessage: string
) => {
  const eventToCancel: CalDavEventObj = {
    ...event,
    rRule: null,
    status: 'CANCELLED',
    props: event.props
      ? {
          ...event.props,
          status: 'CANCELED',
        }
      : {
          status: 'CANCELED',
        },
    exdates: [],
    dtstart: recurrenceID,
    dtend: recurrenceID,
    recurrenceID: recurrenceID,
  };

  await QueueClient.sendEmailQueue(
    formatRecurringCancelInviteData(
      userID,
      eventToCancel,
      createICalStringForAttendees(eventToCancel),
      removeOrganizerFromAttendees(
        eventToCancel.organizer,
        eventToCancel.attendees
      ),
      CALENDAR_METHOD.CANCEL,
      inviteMessage
    )
  );
};

const cancelSingleRepeatedEventAsGuest = async (
  event: CalDavEventObj,
  recurrenceID: DateTimeObject,
  userID: string,
  inviteMessage: string
) => {
  const attendeesNew = event.attendees
    .map((item) => {
      if (item.mailto === event.props[BLOBEN_EVENT_KEY.INVITE_TO]) {
        return {
          ...item,
          PARTSTAT: ATTENDEE_PARTSTAT.DECLINED,
        };
      } else {
        return item;
      }
    })
    .filter((item) => item.mailto === event.props[BLOBEN_EVENT_KEY.INVITE_TO]);

  if (!attendeesNew.length) {
    return;
  }

  event.attendees = attendeesNew;
  event.rRule = null;
  event.exdates = [];
  event.dtstart = recurrenceID;
  event.dtend = recurrenceID;
  event.recurrenceID = recurrenceID;

  const icalStringResponse: string = new ICalHelperV2(
    [
      {
        ...removeBlobenMetaData(event),
        attendees: attendeesNew,
        meta: { hideStatus: true, hideSequence: true },
      },
    ],
    true
  ).parseTo();

  await QueueClient.sendEmailQueue(
    formatPartstatResponseData(
      userID,
      event,
      ATTENDEE_PARTSTAT.DECLINED,
      icalStringResponse,
      [event.organizer.mailto],
      inviteMessage
    )
  );
};

const updateSingleRepeatedEvent = async (
  eventPrev: CalDavEventsRaw,
  eventNew: CalDavEventObj,
  userID: string,
  iCalString: string,
  inviteMessage: string
) => {
  const attendeesNew = removeOrganizerFromAttendees(
    eventNew.organizer,
    eventNew.attendees
  );

  // get attendees not included in updated event
  const attendeesPrev = removeOrganizerFromAttendees(
    eventPrev.organizer,
    eventPrev.attendees
  ).filter((item) => {
    if (!attendeesNew.includes(item)) {
      return item;
    }
  });

  // send invite to new attendees
  if (attendeesNew?.length) {
    await QueueClient.sendEmailQueue(
      formatInviteData(
        userID,
        eventNew,
        iCalString,
        attendeesNew,
        CALENDAR_METHOD.REQUEST,
        inviteMessage
      )
    );
  }

  // cancel event for removed attendees
  if (attendeesPrev?.length) {
    const iCalString = new ICalHelper(eventPrev).parseTo(
      CALENDAR_METHOD.CANCEL
    );

    const inviteData = formatCancelInviteData(
      userID,
      eventPrev,
      iCalString,
      attendeesPrev,
      CALENDAR_METHOD.CANCEL
    );

    await QueueClient.sendEmailQueue(inviteData);
  }
};

const changePartstatStatus = async (
  eventTemp: CalDavEventObj,
  userID: string,
  attendee?: Attendee,
  partstat?: ATTENDEE_PARTSTAT,
  inviteMessage?: string
) => {
  const icalStringResponse: string = new ICalHelperV2(
    [
      formatEventForPartstatEmailResponse(eventTemp, [
        { ...attendee, PARTSTAT: partstat || attendee.PARTSTAT },
      ]),
    ],
    true
  ).parseTo();

  // send email only to organizer
  if (attendee.mailto !== eventTemp.organizer.mailto) {
    await QueueClient.sendEmailQueue(
      formatPartstatResponseData(
        userID,
        eventTemp,
        partstat,
        icalStringResponse,
        [eventTemp.organizer.mailto],
        inviteMessage
      )
    );
  }
};

export const InviteService = {
  createEvent,
  cancelNormalEventAsOrganizer,
  cancelNormalEventAsGuest,
  updateNormalEvent,
  updateSingleRepeatedEvent,
  cancelSingleRepeatedEventAsOrganizer,
  cancelSingleRepeatedEventAsGuest,
  changePartstatStatus,
};
