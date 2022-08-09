import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { PatchCalendarSettingsRequest } from '../../../bloben-interface/calendarSettings/calendarSettings';

import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import CalDavCalendarRepository from '../../../data/repository/CalDavCalendarRepository';
import CalendarSettingsRepository from '../../../data/repository/CalendarSettingsRepository';
import CardDavAddressBookRepository from '../../../data/repository/CardDavAddressBookRepository';

export const patchCalendarSettings = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const body: PatchCalendarSettingsRequest = req.body;

  if (body.defaultCalendarID) {
    const calendar = await CalDavCalendarRepository.getByID(
      body.defaultCalendarID,
      user.id
    );

    if (!calendar) {
      throw throwError(404, 'Calendar not found');
    }
  }

  if (body.defaultAddressBookID) {
    const addressBook = await CardDavAddressBookRepository.getByID(
      body.defaultAddressBookID,
      user.id
    );

    if (!addressBook) {
      throw throwError(404, 'Address book not found');
    }
  }

  await CalendarSettingsRepository.getRepository().update({ user }, body);

  return createCommonResponse('Calendar settings updated');
};
