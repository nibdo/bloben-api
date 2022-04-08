import { Request, Response } from 'express';

import { CalendarSettingsResponse } from '../../../bloben-interface/calendarSettings/calendarSettings';

import { CALENDAR_VIEW } from 'kalend-layout';
import CalendarSettingsRepository from '../../../data/repository/CalendarSettingsRepository';

export const getCalendarSettings = async (
  req: Request,
  res: Response
): Promise<CalendarSettingsResponse> => {
  const { userID } = res.locals;

  const calendarSettings = await CalendarSettingsRepository.findByUserID(
    userID
  );

  return {
    defaultCalendarID: calendarSettings.defaultCalendarID,
    defaultView: calendarSettings.defaultView as CALENDAR_VIEW,
    hourHeight: calendarSettings.hourHeight,
    startOfWeek: calendarSettings.startOfWeek,
    timeFormat: calendarSettings.timeFormat,
    timezone: calendarSettings.timezone,
  };
};
