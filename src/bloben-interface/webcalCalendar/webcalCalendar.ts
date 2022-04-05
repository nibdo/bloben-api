export interface WebcalCalendarData {
  name: string;
  url: string;
}

export interface CreateWebcalCalendarRequest {
  url: string;
  name: string;
  color: string;
  syncFrequency: number;
}

export interface GetWebcalCalendarsResponse {
  id: string;
  name: string;
  color: string;
  syncFrequency: number;
  url: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatchWebcalCalendarRequest {
  isHidden?: boolean;
}
