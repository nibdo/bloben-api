import { createCalDavCalendar } from './handlers/createCalDavCalendar';
import { deleteCalDavCalendar } from './handlers/deleteCalDavCalendar';
import { getCalDavCalendars } from './handlers/getCalDavCalendars';
import { patchCalDavCalendar } from './handlers/patchCalDavCalendar';
import { syncCalDavCalendars } from './handlers/syncCalDavCalendars';
import { updateCalDavCalendar } from './handlers/updateCalDavCalendar';

export default {
  getCalDavCalendars,
  syncCalDavCalendars,
  createCalDavCalendar,
  updateCalDavCalendar,
  deleteCalDavCalendar,
  patchCalDavCalendar,
};
