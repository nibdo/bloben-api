import { CalendarAlarms } from '../interface';

export interface WebcalCalendarData {
  name: string;
  url: string;
}

export interface CreateWebcalCalendarRequest {
  url: string;
  name: string;
  color: string;
  syncFrequency: number;
  alarms: CalendarAlarms[];
}

export interface GetWebcalCalendarsResponse {
  id: string;
  name: string;
  color: string;
  syncFrequency: number;
  url: string;
  isHidden: boolean;
  alarms: CalendarAlarms[];
  createdAt: string;
  updatedAt: string;
}

export interface PatchWebcalCalendarRequest {
  isHidden?: boolean;
}
