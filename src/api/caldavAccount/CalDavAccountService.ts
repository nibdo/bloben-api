import { createCalDavAccount } from './handlers/createCalDavAccount';
import { deleteCalDavAccount } from './handlers/deleteCalDavAccount';
import { getCalDavAccount } from './handlers/getCalDavAccount';
import { getCalDavAccounts } from './handlers/getCalDavAccounts';
import { updateCalDavAccount } from './handlers/updateCalDavAccount';

export default {
  createCalDavAccount,
  getCalDavAccount,
  updateCalDavAccount,
  deleteCalDavAccount,
  getCalDavAccounts,
};
