import { Request, Response } from 'express';

import { CommonResponse, DeleteCalDavEventRequest } from 'bloben-interface';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import {
  createCommonResponse,
  isExternalEmailInvite,
} from '../../../../utils/common';
import { electronService, socketService } from '../../../../service/init';
import { excludeEmailsFromAttendees } from './createCalDavEvent';
import { map } from 'lodash';
import { throwError } from '../../../../utils/errorCodes';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';

export const deleteCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: DeleteCalDavEventRequest = req.body;

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  await DavService.deleteEvent(userID, body.calendarID, event);

  const isExternalInvite = isExternalEmailInvite(event);

  if (event.attendees && body.sendInvite) {
    // send updated partstat to organizer
    if (isExternalInvite) {
      await InviteService.cancelNormalEventAsGuest(
        event,
        userID,
        body.inviteMessage
      );
    } else {
      // as organizer
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

  await CalDavEventRepository.getRepository().delete({
    href: body.url,
    id: body.id,
  });

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );

  await electronService.processWidgetFile();

  return createCommonResponse('Event deleted');
};
