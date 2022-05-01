import { Request, Response } from 'express';

import { BULL_QUEUE, LOG_TAG } from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import { createDavClient } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';
import logger from '../../../utils/logger';

export const deleteCalDavCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { id } = req.params;
  const { userID } = res.locals;

  const calDavCalendar = await CalDavCalendarRepository.getByIDWithAccount(
    id as string,
    userID
  );

  if (!calDavCalendar) {
    throw throwError(404, 'CalDav calendar not found');
  }

  const client = createDavClient(calDavCalendar.account.url, {
    username: calDavCalendar.account.username,
    password: calDavCalendar.account.password,
  });

  await client.login();

  const response = await client.deleteObject({ url: calDavCalendar.url });

  if (response.status >= 300) {
    logger.error('Delete caldav calendar error', response.statusText, [
      LOG_TAG.CALDAV,
    ]);
    throw throwError(409, response.statusText);
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('CalDav calendar deleted');
};
