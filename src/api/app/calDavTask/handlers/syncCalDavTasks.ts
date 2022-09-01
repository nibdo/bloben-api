import { BULL_QUEUE } from '../../../../utils/enums';
import { CommonResponse } from 'bloben-interface';
import { Request, Response } from 'express';
import {
  calDavSyncBullQueue,
  calDavTaskSyncBullQueue,
} from '../../../../service/BullQueue';
import { createCommonResponse } from '../../../../utils/common';

export const syncCalDavTasks = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });
  await calDavTaskSyncBullQueue.add(BULL_QUEUE.CALDAV_TASK_SYNC, { userID });

  return createCommonResponse('Sync success');
};
