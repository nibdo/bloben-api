import { Request, Response } from 'express';

import {
  CommonResponse,
  UpdatePartstatStatusRepeatedEventRequest,
} from 'bloben-interface';

import { BULL_QUEUE } from '../../../../utils/enums';
import { DavService } from '../../../../service/davService';
import { REPEATED_EVENT_CHANGE_TYPE } from 'bloben-interface/enums';
import {
  calDavSyncBullQueue,
  emailBullQueue,
} from '../../../../service/BullQueue';
import {
  createCommonResponse,
  getUserMailto,
  isExternalEmailInvite,
} from '../../../../utils/common';
import { filter, map } from 'lodash';
import { formatEventForPartstatEmailResponse } from '../../../../jobs/queueJobs/processEmailEventJob';
import { formatPartstatResponseData } from '../../../../utils/davHelper';
import { throwError } from '../../../../utils/errorCodes';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../../utils/ICalHelperV2';

export const updatePartstatStatusRepeatedEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { eventID } = req.params;

  const body: UpdatePartstatStatusRepeatedEventRequest = req.body;

  const event = await CalDavEventRepository.getCalDavEventByID(userID, eventID);

  if (!event) {
    throw throwError(404, 'Event not found');
  }

  const userMailto = getUserMailto(event);

  const isEmailInvite = isExternalEmailInvite(event);

  let icalObjForEmail;

  switch (body.type) {
    case REPEATED_EVENT_CHANGE_TYPE.ALL:
      icalObjForEmail = await DavService.updatePartstatRepeatedChangeAll(
        userID,
        body,
        event,
        userMailto
      );
      break;
    case REPEATED_EVENT_CHANGE_TYPE.SINGLE:
      icalObjForEmail = await DavService.updatePartstatSingleRepeated(
        userID,
        event,
        body,
        userMailto
      );

      break;
  }

  if (body.sendInvite && isEmailInvite) {
    const icalStringResponse: string = new ICalHelperV2(
      map(icalObjForEmail, (item) => {
        const attendees = filter(item.attendees, (attendee) => {
          return attendee.mailto === userMailto;
        });

        return formatEventForPartstatEmailResponse(item, attendees);
      }),
      true
    ).parseTo();

    await emailBullQueue.add(
      BULL_QUEUE.EMAIL,
      formatPartstatResponseData(
        userID,
        event,
        body.status,
        icalStringResponse,
        [event.organizer],
        body.inviteMessage
      )
    );
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('Event partstat status updated');
};
