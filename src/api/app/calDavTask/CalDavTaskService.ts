import { createCalDavTask } from './handlers/createCalDavTask';
import { deleteCalDavTask } from './handlers/deleteCalDavTask';
import { getCalDavTasks } from './handlers/getCalDavTasks';
import { syncCalDavTasks } from './handlers/syncCalDavTasks';
import { updateCalDavTask } from './handlers/updateCalDavTask';

export default {
  syncCalDavTasks,
  createCalDavTask,
  deleteCalDavTask,
  updateCalDavTask,
  getCalDavTasks,
};
