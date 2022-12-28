import { Request, Response } from 'express';

import {
  CommonResponse,
  REPEATED_EVENT_CHANGE_TYPE,
  UpdatePartstatStatusRepeatedEventRequest,
} from 'bloben-interface';

import {
  CalDavEventObj,
  formatPartstatResponseData,
} from '../../../../utils/davHelper';
import { DavService } from '../../../../service/davService';
import { QueueClient } from '../../../../service/init';
import {
  createCommonResponse,
  getUserMailto,
  isExternalEmailInvite,
} from '../../../../utils/common';
import { filter, map } from 'lodash';
import { formatEventForPartstatEmailResponse } from '../../../../jobs/queueJobs/processEmailEventJob';
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

  let icalObjForEmail: CalDavEventObj[] = [];

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
    const events = map(icalObjForEmail, (item) => {
      const attendees = filter(item.attendees, (attendee) => {
        return attendee.mailto === userMailto;
      });

      return formatEventForPartstatEmailResponse(item, attendees);
    });
    const icalStringResponse: string = new ICalHelperV2(events, true).parseTo();

    await QueueClient.sendEmailQueue(
      formatPartstatResponseData(
        userID,
        event,
        body.status,
        icalStringResponse,
        [event.organizer.mailto],
        body.inviteMessage
      )
    );
  }

  await QueueClient.syncCalDav(userID);

  return createCommonResponse('Event partstat status updated');
};
