import ServerSettingsRepository from '../data/repository/ServerSettingsRepository';

const setMaxEmailLimit = async () => {
  const serverSettingsAll =
    await ServerSettingsRepository.getRepository().find();
  const serverSettings = serverSettingsAll?.[0];

  await ServerSettingsRepository.getRepository().update(serverSettings.id, {
    emailCounter: 50,
  });
};

export const ElectronHelper = {
  setMaxEmailLimit,
};
