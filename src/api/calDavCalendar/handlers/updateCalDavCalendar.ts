import { Request, Response } from 'express';

import { BULL_QUEUE, LOG_TAG } from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { DAVNamespaceShort } from 'tsdav';
import { UpdateCalDavCalendarRequest } from '../../../bloben-interface/calDavCalendar/calDavCalendar';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import { createDavClient } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';
import logger from '../../../utils/logger';

export const updateCalDavCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { id } = req.params;
  const { userID } = res.locals;
  const body: UpdateCalDavCalendarRequest = req.body;

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

  const response = await client.updateObject({
    url: calDavCalendar.url,
    data: JSON.stringify({
      [`${DAVNamespaceShort.DAV}:displayname`]: body.name,
      [`${DAVNamespaceShort.CALDAV}:supported-calendar-component-set`]:
        body.components,
      [`${DAVNamespaceShort.CALDAV_APPLE}:calendar-color`]: body.color,
    }),
  });

  if (response.status >= 300) {
    logger.error('Update caldav calendar error', response?.[0], [
      LOG_TAG.CALDAV,
    ]);
    throw throwError(409, 'Cannot update caldav calendar');
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('CalDav calendar updated');
};
