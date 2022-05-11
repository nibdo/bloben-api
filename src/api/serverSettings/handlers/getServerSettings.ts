import { GetServerSettings } from '../../../bloben-interface/serverSettings/serverSettings';
import { throwError } from '../../../utils/errorCodes';
import ServerSettingsRepository from '../../../data/repository/ServerSettingsRepository';

export const getServerSettings = async (): Promise<GetServerSettings> => {
  const serverSettings =
    await ServerSettingsRepository.getRepository().findOne();

  if (!serverSettings) {
    throw throwError(404, 'Server settings not found');
  }

  return {
    checkNewVersion: serverSettings.checkNewVersion,
    emailCounter: serverSettings.emailCounter,
  };
};
