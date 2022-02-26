import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateCalDavEventRequest } from '../../../bloben-interface/event/event';
import { SOCKET_CHANNEL, SOCKET_ROOM_NAMESPACE } from '../../../utils/enums';
import { createCommonResponse } from '../../../utils/common';
import { createEventFromCalendarObject } from '../../../utils/davHelper';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';

export const createCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const body: CreateCalDavEventRequest = req.body;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount || (calDavAccount && !calDavAccount.calendar?.id)) {
    throw throwError(404, 'Account with calendar not found');
  }

  const client = await loginToCalDav(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });

  const response: any = await client.createCalendarObject({
    calendar: calDavAccount.calendar,
    filename: `${body.id}.ics`,
    iCalString: body.iCalString,
  });

  const fetchedEvents = await client.fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [response.url],
  });

  const eventTemp = createEventFromCalendarObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  if (eventTemp) {
    const newEvent = new CalDavEventEntity(eventTemp);

    await CalDavEventRepository.getRepository().save(newEvent);
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: 'SYNC' })
  );

  // delete cache
  // await CalDavCacheService.deleteByUserID(userID);

  // trigger resync for cached events
  // await CalDavCacheService.syncEventsForAccount(calDavAccount);

  return createCommonResponse();
};
