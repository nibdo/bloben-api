import { createUserEmailConfig } from './handlers/createUserEmailConfig';
import { deleteUserEmailConfig } from './handlers/deleteUserEmailConfig';
import { getUserEmailConfigs } from './handlers/getUserEmailConfigs';
import { patchUserEmailConfig } from './handlers/patchUserEmailConfig';
import { updateUserEmailConfig } from './handlers/updateUserEmailConfig';

export default {
  createUserEmailConfig,
  updateUserEmailConfig,
  getUserEmailConfigs,
  deleteUserEmailConfig,
  patchUserEmailConfig,
};
