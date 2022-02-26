import { BULL_QUEUE } from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { Request, Response } from 'express';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';

export const getSync = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('Sync success');
};
