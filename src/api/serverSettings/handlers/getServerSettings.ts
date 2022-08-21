import { GetServerSettings } from '../../../bloben-interface/serverSettings/serverSettings';
import { LOCATION_PROVIDER } from '../../../bloben-interface/enums';
import { throwError } from '../../../utils/errorCodes';
import ServerSettingsRepository from '../../../data/repository/ServerSettingsRepository';

export const getServerSettings = async (): Promise<GetServerSettings> => {
  const serverSettingsAll =
    await ServerSettingsRepository.getRepository().find();
  const serverSettings = serverSettingsAll?.[0];

  if (!serverSettings) {
    throw throwError(404, 'Server settings not found');
  }

  return {
    checkNewVersion: serverSettings.checkNewVersion,
    emailCounter: serverSettings.emailCounter,
    locationProvider: serverSettings.locationProvider as LOCATION_PROVIDER,
  };
};
