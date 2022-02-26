import { createWebcalCalendar } from './handlers/createWebcalCalendar';
import { deleteWebcalCalendar } from './handlers/deleteWebcalCalendar';
import { getWebcalCalendars } from './handlers/getWebcalCalendars';
import { updateWebcalCalendar } from './handlers/updateWebcalCalendar';

const WebcalCalendarService: any = {
  createWebcalCalendar,
  getWebcalCalendars,
  updateWebcalCalendar,
  deleteWebcalCalendar,
};

export default WebcalCalendarService;
