import { getServerSettings } from './handlers/getServerSettings';
import { getServerSettingsUser } from './handlers/getServerSettingsUser';
import { patchServerSettings } from './handlers/patchServerSettings';

export default {
  getServerSettings,
  patchServerSettings,
  getServerSettingsUser,
};
