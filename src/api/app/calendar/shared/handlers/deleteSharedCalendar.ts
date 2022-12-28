import { NextFunction, Request, Response } from 'express';

import { MemoryClient } from '../../../../../service/init';
import { REDIS_PREFIX } from '../../../../../utils/enums';
import { createCommonResponse } from '../../../../../utils/common';
import { throwError } from '../../../../../utils/errorCodes';
import SharedLinkRepository from '../../../../../data/repository/SharedLinkRepository';

export const removeCachePublicCalendar = async (id: string) => {
  await MemoryClient.del(`${REDIS_PREFIX.PUBLIC_SHARED_LINK}_${id}`);
  await MemoryClient.del(`${REDIS_PREFIX.PUBLIC_CALENDAR_CACHE}_${id}`);
  await MemoryClient.del(`${REDIS_PREFIX.PUBLIC_EVENTS_CACHE}_${id}_*`);
};

export const deleteSharedCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { id } = req.params;

    const sharedLinkRaw = await SharedLinkRepository.getSharedLinkByID(
      id,
      userID
    );

    if (!sharedLinkRaw) {
      throw throwError(404, 'Shared link not found');
    }

    await SharedLinkRepository.getRepository().delete(id);

    await removeCachePublicCalendar(id);

    return res.json(createCommonResponse('Shared link deleted'));
  } catch (error) {
    next(error);
  }
};
