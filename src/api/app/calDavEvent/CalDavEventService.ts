import { createCalDavEvent } from './handlers/createCalDavEvent';
import { deleteCalDavEvent } from './handlers/deleteCalDavEvent';
import { deleteRepeatedCalDavEvent } from './handlers/deleteRepeatedCalDavEvent';
import { getCalDavEvent } from './handlers/getCalDavEvent';
import { updateCalDavEvent } from './handlers/updateCalDavEvent';
import { updatePartstatStatus } from './handlers/updatePartstatStatus';
import { updatePartstatStatusRepeatedEvent } from './handlers/updatePartstatStatusRepeatedEvent';
import { updateRepeatedCalDavEvent } from './handlers/updateRepeatedCalDavEvent';

const CalDavEventService = {
  createCalDavEvent,
  updateCalDavEvent,
  deleteCalDavEvent,
  getCalDavEvent,
  updateRepeatedCalDavEvent,
  deleteRepeatedCalDavEvent,
  updatePartstatStatus,
  updatePartstatStatusRepeatedEvent,
};

export default CalDavEventService;
