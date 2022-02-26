import { createCalDavEvent } from './handlers/createCalDavEvent';
import { deleteCalDavEvent } from './handlers/deleteCalDavEvent';
import { syncCalDavEvents } from './handlers/syncCalDavEvents';
import { updateCalDavEvent } from './handlers/updateCalDavEvent';

const CalDavEventService = {
  createCalDavEvent,
  updateCalDavEvent,
  deleteCalDavEvent,
  syncCalDavEvents,
};

export default CalDavEventService;
