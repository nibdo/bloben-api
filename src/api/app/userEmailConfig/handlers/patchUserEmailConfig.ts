import { Request, Response } from 'express';

import { CommonResponse, PatchUserEmailConfigRequest } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

export const patchUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: PatchUserEmailConfigRequest = req.body;
  const { userID } = res.locals;

  if (body.calendarForImportID) {
    const calendar = await CalDavCalendarRepository.getByID(
      body.calendarForImportID,
      userID
    );

    if (!calendar) {
      throw throwError(404, 'Calendar not found', req);
    }
  }

  await UserEmailConfigRepository.getRepository().update(
    {
      userID,
    },
    {
      calendarForImportID: body.calendarForImportID,
    }
  );

  return createCommonResponse('User email config updated');
};
