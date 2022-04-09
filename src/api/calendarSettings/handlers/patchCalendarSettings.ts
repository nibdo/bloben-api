import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { PatchCalendarSettingsRequest } from '../../../bloben-interface/calendarSettings/calendarSettings';

import { createCommonResponse } from '../../../utils/common';
import CalendarSettingsRepository from '../../../data/repository/CalendarSettingsRepository';

export const patchCalendarSettings = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const body: PatchCalendarSettingsRequest = req.body;

  await CalendarSettingsRepository.getRepository().update({ user }, body);

  return createCommonResponse('Calendar settings updated');
};
