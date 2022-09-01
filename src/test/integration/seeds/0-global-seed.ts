import { LOCATION_PROVIDER } from '../../../data/types/enums';
import ServerSettingsEntity from '../../../data/entity/ServerSettingsEntity';
import ServerSettingsRepository from '../../../data/repository/ServerSettingsRepository';

export const globalSeed = async () => {
  const serverSettingsExisting =
    await ServerSettingsRepository.getRepository().findOne({
      where: {
        id: 1,
      },
    });

  if (serverSettingsExisting) {
    return;
  }

  const serverSettings = new ServerSettingsEntity();
  serverSettings.locationProvider = LOCATION_PROVIDER.OPEN_STREET_MAPS;
  serverSettings.emailCounter = 0;

  await ServerSettingsRepository.getRepository().save(serverSettings);
};
