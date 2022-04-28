import { CalendarAlarms } from '../../../bloben-interface/interface';
import { GetWebcalCalendarsResponse } from '../../../bloben-interface/webcalCalendar/webcalCalendar';
import { Request, Response } from 'express';
import { map } from 'lodash';
import WebcalCalendarRepository from '../../../data/repository/WebcalCalendarRepository';

interface WebcalendarRaw {
  id: string;
  url: string;
  syncFrequency: number;
  name: string;
  color: string;
  isHidden: boolean;
  alarms: CalendarAlarms[];
  createdAt: string;
  updatedAt: string;
}

export const getWebcalCalendars = async (
  req: Request,
  res: Response
): Promise<GetWebcalCalendarsResponse[]> => {
  const { userID } = res.locals;

  const webcalCalendars: WebcalendarRaw[] =
    await WebcalCalendarRepository.getRepository().query(
      `
         SELECT 
            wc.id as "id", 
            wc.url as "url", 
            wc.sync_frequency as "syncFrequency", 
            wc.name as "name", 
            wc.color as "color", 
            wc.is_hidden as "isHidden",
            wc.created_at as "createdAt", 
            wc.updated_at as "updatedAt",
            wc.alarms as "alarms"
         FROM webcal_calendars wc
         JOIN users u ON u.id = wc.user_id
         WHERE 
            u.id = $1
            AND wc.deleted_at IS NULL
         `,
      [userID]
    );

  return map(webcalCalendars, (item) => ({
    id: item.id,
    name: item.name,
    color: item.color,
    syncFrequency: item.syncFrequency / 60,
    url: item.url,
    isHidden: item.isHidden,
    alarms: item.alarms || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};
