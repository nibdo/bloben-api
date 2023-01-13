import { Request, Response } from 'express';

import {
  CommonResponse,
  EventResult,
  UpdateRepeatedCalDavEventRequest,
} from 'bloben-interface';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import { createCommonResponse } from '../../../../utils/common';

import {
  QueueClient,
  electronService,
  socketService,
} from '../../../../service/init';
import { throwError } from '../../../../utils/errorCodes';
import CalDavEventExceptionRepository from '../../../../data/repository/CalDavEventExceptionRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../../utils/ICalHelperV2';
import logger from '../../../../utils/logger';

const handleSingleEventChange = async (
  prevEvent: CalDavEventsRaw,
  body: UpdateRepeatedCalDavEventRequest,
  userID: string
) => {
  const { response, eventItem } = await DavService.updateSingleRepeatedEvent(
    userID,
    prevEvent.calendarID,
    prevEvent,
    body
  );

  if (body.sendInvite) {
    const iCalStringInvite = new ICalHelperV2([eventItem]).parseTo();
    await InviteService.updateNormalEvent(
      prevEvent,
      eventItem,
      userID,
      iCalStringInvite,
      body.inviteMessage
    );
  }

  return {
    response,
  };
};

const handleChangeAllWithCalendar = async (
  body: UpdateRepeatedCalDavEventRequest,
  userID: string,
  prevEvent: CalDavEventsRaw
) => {
  const { response, eventsData, iCalString } =
    await DavService.updateRepeatedAllWithCalendarChange(
      userID,
      body.calendarID,
      prevEvent,
      body
    );

  await CalDavEventExceptionRepository.deleteExceptions(
    body.event.externalID,
    userID
  );

  if (body.sendInvite) {
    await InviteService.updateNormalEvent(
      prevEvent,
      eventsData[0],
      userID,
      iCalString,
      body.inviteMessage
    );
  }

  return {
    response,
  };
};

const handleChangeAll = async (
  body: UpdateRepeatedCalDavEventRequest,
  userID: string,
  prevEvent: CalDavEventsRaw
) => {
  const { response, eventsData, iCalString } = await DavService.handleChangeAll(
    userID,
    body.calendarID,
    prevEvent,
    body
  );

  if (body.sendInvite) {
    await InviteService.updateNormalEvent(
      prevEvent,
      eventsData[0],
      userID,
      iCalString,
      body.inviteMessage
    );
  }

  await CalDavEventExceptionRepository.deleteExceptions(
    body.event.externalID,
    userID
  );

  return {
    response,
  };
};

const handleChangeThisAndFuture = async (
  prevEvent: CalDavEventsRaw,
  body: UpdateRepeatedCalDavEventRequest,
  userID: string
) => {
  const { calDavAccount, davRequestData, originRRule, eventsData, iCalString } =
    await DavService.changeThisAndFutureUntilEvent(
      userID,
      body.calendarID,
      prevEvent,
      body
    );

  if (body.sendInvite) {
    await InviteService.updateNormalEvent(
      prevEvent,
      eventsData[0],
      userID,
      iCalString,
      ''
    );
  }

  const { response, iCalStringNew, dataNew } =
    await DavService.createNewEventForThisAndFuture(
      userID,
      calDavAccount,
      davRequestData,
      body,
      originRRule,
      eventsData
    );

  if (body.sendInvite) {
    await InviteService.createEvent(
      dataNew,
      userID,
      iCalStringNew,
      body.inviteMessage
    );
  }

  return {
    response,
  };
};

interface Event extends EventResult {
  valarms?: any[];
  alarms?: any[];
}
interface Body extends UpdateRepeatedCalDavEventRequest {
  event: Event;
}
export const updateRepeatedCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: Body = req.body;

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  body.event.valarms = body.event.alarms;

  let result;

  if (body.type !== REPEATED_EVENT_CHANGE_TYPE.ALL && body.prevEvent) {
    throw throwError(
      409,
      'Repeated event can update calendar only for all instances'
    );
  }

  if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL && body.prevEvent) {
    result = await handleChangeAllWithCalendar(body, userID, event);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.SINGLE) {
    result = await handleSingleEventChange(event, body, userID);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.ALL) {
    result = await handleChangeAll(body, userID, event);
  } else if (body.type === REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE) {
    result = await handleChangeThisAndFuture(event, body, userID);
  }

  if (result.response.status >= 300) {
    logger.error(
      `Status: ${result.response.status} Message: ${result.response.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, `Cannot create event: ${result.response.statusText}`);
  }

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );
  await electronService.processWidgetFile();

  await QueueClient.syncCalDav(userID);

  return createCommonResponse('Event updated', {});
};
