import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { CALENDAR_METHOD } from '../../../../utils/ICalHelper';
import { CalDavEventObj } from '../../../../utils/davHelper';
import {
  CommonResponse,
  DeleteRepeatedCalDavEventRequest,
} from 'bloben-interface';
import {
  DavRequestData,
  getDavRequestData,
} from '../../../../utils/davAccountHelper';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import { calDavSyncBullQueue } from '../../../../service/BullQueue';
import {
  createCommonResponse,
  isExternalEmailInvite,
} from '../../../../utils/common';
import { excludeEmailsFromAttendees } from './createCalDavEvent';
import { io } from '../../../../app';
import { map } from 'lodash';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventExceptionRepository from '../../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../../../../data/repository/CalDavEventRepository';
import logger from '../../../../utils/logger';

export interface RepeatEventDeleteResult {
  response: any;
  attendeesData?: {
    icalString: string;
    event: CalDavEventObj;
    method: CALENDAR_METHOD;
  }[];
}
const handleDeleteSingle = async (
  body: DeleteRepeatedCalDavEventRequest,
  davRequestData: DavRequestData,
  calDavAccount: any,
  event: CalDavEventsRaw,
  isExternalInvite: boolean,
  userID: string
): Promise<RepeatEventDeleteResult> => {
  const { eventsTemp, response } = await DavService.deleteSingleRepeatedEvent(
    userID,
    body.calendarID,
    event,
    body.exDates
  );

  if (body.sendInvite) {
    if (isExternalInvite) {
      await InviteService.cancelSingleRepeatedEventAsGuest(
        eventsTemp[0],
        body.recurrenceID,
        userID,
        body.inviteMessage
      );
    } else {
      await InviteService.cancelSingleRepeatedEventAsOrganizer(
        eventsTemp[0],
        body.recurrenceID,
        userID,
        body.inviteMessage
      );
    }
  }

  return {
    response,
  };
};

const handleDeleteSingleRecurrence = async (
  body: DeleteRepeatedCalDavEventRequest,
  davRequestData: DavRequestData,
  calDavAccount: any,
  userID: string,
  event: CalDavEventsRaw,
  isExternalInvite: boolean
): Promise<RepeatEventDeleteResult> => {
  const { eventsTemp, response, eventsData } =
    await DavService.deleteExistingException(
      userID,
      body.calendarID,
      event,
      body.recurrenceID
    );

  if (body.sendInvite) {
    if (isExternalInvite) {
      await InviteService.cancelSingleRepeatedEventAsGuest(
        eventsTemp[0],
        body.recurrenceID,
        userID,
        body.inviteMessage
      );
    } else {
      await InviteService.cancelSingleRepeatedEventAsOrganizer(
        eventsTemp[0],
        body.recurrenceID,
        userID,
        body.inviteMessage
      );
    }
  }

  await CalDavEventExceptionRepository.getRepository().query(
    `
    DELETE FROM caldav_event_exceptions
     WHERE 
        external_id = $1
        AND user_id = $2
        AND exception_date = $3
  `,
    [eventsData[0]?.externalID, userID, body.recurrenceID?.value]
  );

  return {
    response,
    attendeesData: [],
  };
};

const handleDeleteAll = async (
  body: DeleteRepeatedCalDavEventRequest,
  davRequestData: DavRequestData,
  calDavAccount: any,
  event: CalDavEventsRaw,
  isExternalInvite: boolean,
  userID: string
): Promise<RepeatEventDeleteResult> => {
  const { response } = await DavService.deleteEvent(
    userID,
    body.calendarID,
    event
  );

  if (body.sendInvite) {
    if (isExternalInvite) {
      await InviteService.cancelNormalEventAsGuest(
        event,
        userID,
        body.inviteMessage
      );
    } else {
      await InviteService.cancelNormalEventAsOrganizer(
        event,
        userID,
        map(
          excludeEmailsFromAttendees([event.organizer.mailto], event.attendees),
          'mailto'
        ),
        body.inviteMessage
      );
    }
  }

  return {
    response,
  };
};

export const deleteRepeatedCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: DeleteRepeatedCalDavEventRequest = req.body;

  // get account with calendar
  const [calDavAccount, event] = await Promise.all([
    CalDavAccountRepository.getByUserIDAndCalendarID(userID, body.calendarID),
    CalDavEventRepository.getCalDavEventByID(userID, body.id),
  ]);

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  const isExternalInvite = isExternalEmailInvite(event);

  const davRequestData = getDavRequestData(calDavAccount);

  let result;
  if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL) {
    result = await handleDeleteAll(
      body,
      davRequestData,
      calDavAccount,
      event,
      isExternalInvite,
      userID
    );
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE_RECURRENCE_ID) {
    result = await handleDeleteSingleRecurrence(
      body,
      davRequestData,
      calDavAccount,
      userID,
      event,
      isExternalInvite
    );
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE) {
    result = await handleDeleteSingle(
      body,
      davRequestData,
      calDavAccount,
      event,
      isExternalInvite,
      userID
    );
  }

  if (result.response.status >= 300) {
    logger.error(
      `Status: ${result.response.status} Message: ${result.response.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, `Cannot delete event: ${result.response.statusText}`);
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  await CalDavEventRepository.getRepository().delete({
    href: body.url,
    id: body.id,
  });

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
  );

  return createCommonResponse('Event deleted');
};
