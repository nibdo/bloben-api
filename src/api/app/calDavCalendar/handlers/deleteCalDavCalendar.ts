import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import {
  QueueClient,
  electronService,
  socketService,
} from '../../../../service/init';
import { createCommonResponse } from '../../../../utils/common';
import { deleteObject } from 'tsdav';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { throwError } from '../../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import logger from '../../../../utils/logger';

export const deleteCalDavCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { id } = req.params;
  const { userID } = res.locals;

  const [useEmailConfig, calDavCalendar] = await Promise.all([
    UserEmailConfigRepository.findByUserIDAndImportID(userID, id),
    CalDavCalendarRepository.getByIDWithAccount(id as string, userID),
  ]);

  if (!calDavCalendar) {
    throw throwError(404, 'CalDav calendar not found');
  }

  if (useEmailConfig) {
    throw throwError(
      409,
      'Cannot delete calendar used for importing email invites'
    );
  }

  const davRequestData = getDavRequestData({
    ...calDavCalendar.account,
    accountType: 'caldav',
  });
  const { davHeaders } = davRequestData;

  const response = await deleteObject({
    headers: davHeaders,
    url: calDavCalendar.url,
  });

  if (response.status >= 300) {
    logger.error('Delete caldav calendar error', response.statusText, [
      LOG_TAG.CALDAV,
    ]);
    throw throwError(409, response.statusText);
  }

  await CalDavCalendarRepository.getRepository().delete(id);

  socketService.emit(
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS }),
    SOCKET_CHANNEL.SYNC,
    `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
  );
  await electronService.processWidgetFile();

  await QueueClient.syncCalDav(userID);

  return createCommonResponse('CalDav calendar deleted');
};
