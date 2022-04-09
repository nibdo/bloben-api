import { CALENDAR_VIEW } from 'kalend-layout';

export interface PatchCalendarSettingsRequest {
  timeFormat?: number;
  startOfWeek?: string;
  defaultView?: CALENDAR_VIEW;
  hourHeight?: number;
  defaultCalendarID?: string;
  timezone?: string;
}

export interface CalendarSettingsResponse {
  timeFormat: number;
  startOfWeek: string;
  defaultView: CALENDAR_VIEW;
  hourHeight: number;
  defaultCalendarID: string;
  timezone: string;
}
