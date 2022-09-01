import { GetServerSettingsUser } from 'bloben-interface';
import { LOCATION_PROVIDER } from '../../../../data/types/enums';
import { throwError } from '../../../../utils/errorCodes';
import ServerSettingsRepository from '../../../../data/repository/ServerSettingsRepository';

export const getServerSettingsUser =
  async (): Promise<GetServerSettingsUser> => {
    const serverSettingsAll =
      await ServerSettingsRepository.getRepository().find();
    const serverSettings = serverSettingsAll?.[0];

    if (!serverSettings) {
      throw throwError(404, 'Server settings not found');
    }

    return {
      locationProvider: serverSettings.locationProvider as LOCATION_PROVIDER,
    };
  };
