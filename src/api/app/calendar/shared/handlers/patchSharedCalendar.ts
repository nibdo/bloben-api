import { NextFunction, Request, Response } from 'express';

import { createCommonResponse } from '../../../../../utils/common';
import { removeCachePublicCalendar } from './deleteSharedCalendar';
import { throwError } from '../../../../../utils/errorCodes';
import SharedLinkRepository from '../../../../../data/repository/SharedLinkRepository';

export const patchSharedCalendar = async (
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

    await SharedLinkRepository.getRepository().update(id, {
      isEnabled: !sharedLinkRaw.isEnabled,
    });

    await removeCachePublicCalendar(id);

    return res.json(createCommonResponse('Shared link updated'));
  } catch (error) {
    next(error);
  }
};
