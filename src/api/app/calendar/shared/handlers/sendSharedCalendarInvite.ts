import { NextFunction, Request, Response } from 'express';

import { DateTime } from 'luxon';
import { PostSendSharedCalendarInviteRequest } from 'bloben-interface';
import { QueueClient } from '../../../../../service/init';
import { createCommonResponse } from '../../../../../utils/common';
import { formatGeneralEmailData } from '../../../../../utils/davHelper';
import { throwError } from '../../../../../utils/errorCodes';
import SharedLinkRepository from '../../../../../data/repository/SharedLinkRepository';

export const sendSharedCalendarInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { id } = req.params;
    const body: PostSendSharedCalendarInviteRequest = req.body;

    const sharedLink = await SharedLinkRepository.getSharedLinkByID(id, userID);

    if (!sharedLink) {
      throw throwError(404, 'Shared calendar not found');
    }

    if (!sharedLink.isEnabled) {
      throw throwError(409, 'Cannot send invite to disabled shared calendar');
    }

    if (
      sharedLink.expireAt &&
      DateTime.fromJSDate(sharedLink.expireAt).valueOf() <=
        DateTime.now().valueOf()
    ) {
      throw throwError(409, 'Cannot send invite to expired shared calendar');
    }

    await QueueClient.sendEmailQueue(
      formatGeneralEmailData(
        userID,
        body.recipients,
        'Calendar invite',
        body.emailBody
      )
    );

    return res.json(createCommonResponse('Invite email sent'));
  } catch (error) {
    next(error);
  }
};
