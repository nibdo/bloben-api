import { Request, Response } from 'express';

import { ATTENDEE_PARTSTAT } from '../../../../data/types/enums';
import {
  BLOBEN_EVENT_KEY,
  BULL_QUEUE,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import {
  CommonResponse,
  DeleteCalDavEventRequest,
  UserEmailConfigData,
} from 'bloben-interface';
import { CryptoAes } from '../../../../utils/CryptoAes';
import {
  createCommonResponse,
  handleDavResponse,
  isExternalEmailInvite,
} from '../../../../utils/common';
import { deleteCalendarObject } from 'tsdav';
import { emailBullQueue } from '../../../../service/BullQueue';
import {
  formatCancelInviteData,
  formatPartstatResponseData,
  removeBlobenMetaData,
} from '../../../../utils/davHelper';
import { formatEventRawToCalDavObj } from '../../../../utils/format';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { io } from '../../../../app';
import { removeOrganizerFromAttendees } from './createCalDavEvent';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventRepository, {
  CalDavEventsRaw,
} from '../../../../data/repository/CalDavEventRepository';
import ICalHelper, { CALENDAR_METHOD } from '../../../../utils/ICalHelper';
import ICalHelperV2 from '../../../../utils/ICalHelperV2';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

const handleResponseAsAttendee = async (
  event: CalDavEventsRaw,
  userID: string,
  body: DeleteCalDavEventRequest
) => {
  const userEmailConfig = await UserEmailConfigRepository.findByUserID(userID);

  if (userEmailConfig) {
    const userEmailConfigData: UserEmailConfigData | null =
      await CryptoAes.decrypt(userEmailConfig.data);

    if (
      userEmailConfigData &&
      userEmailConfigData.smtp.smtpEmail ===
        event.props[BLOBEN_EVENT_KEY.INVITE_TO]
    ) {
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
        .filter(
          (item) => item.mailto === event.props[BLOBEN_EVENT_KEY.INVITE_TO]
        );

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

      await emailBullQueue.add(
        BULL_QUEUE.EMAIL,
        formatPartstatResponseData(
          userID,
          event,
          ATTENDEE_PARTSTAT.DECLINED,
          icalStringResponse,
          [event.organizer],
          body.inviteMessage
        )
      );
    }
  }
};

const handleResponseAsOrganizer = async (
  event: CalDavEventsRaw,
  userID: string,
  body: DeleteCalDavEventRequest
) => {
  const icalString = new ICalHelper(event).parseTo(CALENDAR_METHOD.CANCEL);

  await emailBullQueue.add(
    BULL_QUEUE.EMAIL,
    formatCancelInviteData(
      userID,
      event,
      icalString,
      removeOrganizerFromAttendees(event.organizer, event.attendees),
      CALENDAR_METHOD.CANCEL,
      body.inviteMessage
    )
  );
};

export const deleteCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  const body: DeleteCalDavEventRequest = req.body;

  // get account with calendar and event
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

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  const response = await deleteCalendarObject({
    headers: davHeaders,
    calendarObject: {
      url: body.url,
      etag: body.etag,
    },
  });

  handleDavResponse(response, 'Delete caldav event error');

  const isExternalInvite = isExternalEmailInvite(event);

  if (event.attendees && body.sendInvite) {
    // send updated partstat to organizer
    if (isExternalInvite) {
      await handleResponseAsAttendee(event, userID, body);
    } else {
      await handleResponseAsOrganizer(event, userID, body);
    }
  }

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
