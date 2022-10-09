import { Request, Response } from 'express';

import { CalendarSettingsResponse } from 'bloben-interface';

import { CALENDAR_VIEW } from 'kalend/common/enums';
import CalendarSettingsEntity from '../../../../data/entity/CalendarSettings';
import CalendarSettingsRepository from '../../../../data/repository/CalendarSettingsRepository';

export const getCalendarSettings = async (
  req: Request,
  res: Response
): Promise<CalendarSettingsResponse> => {
  const { userID } = res.locals;

  let calendarSettings = await CalendarSettingsRepository.findByUserID(userID);

  if (!calendarSettings) {
    calendarSettings = new CalendarSettingsEntity();
    calendarSettings.userID = userID;

    await CalendarSettingsRepository.getRepository().save(calendarSettings);
  }

  return {
    defaultCalendarID: calendarSettings.defaultCalendarID,
    defaultView: calendarSettings.defaultView as CALENDAR_VIEW,
    hourHeight: calendarSettings.hourHeight,
    startOfWeek: calendarSettings.startOfWeek,
    timeFormat: calendarSettings.timeFormat,
    timezone: calendarSettings.timezone,
    showWeekNumbers: calendarSettings.showWeekNumbers,
    defaultAddressBookID: calendarSettings.defaultAddressBookID,
    saveContactsAuto: calendarSettings.saveContactsAuto,
    showTasks: calendarSettings.showTasks,
  };
};
