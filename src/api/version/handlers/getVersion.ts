import { GetVersion } from '../../../bloben-interface/version/version';
import RedisService from '../../../service/RedisService';
import ServerSettingsRepository from '../../../data/repository/ServerSettingsRepository';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageFile: any = require('../../../../package.json');

export const getVersion = async (): Promise<GetVersion> => {
  let lastVersion = await RedisService.getLastVersion();

  if (!lastVersion) {
    const serverSettingsAll =
      await ServerSettingsRepository.getRepository().find();
    const serverSettings = serverSettingsAll?.[0];

    if (serverSettings.checkNewVersion) {
      const response = await axios.get('https://bloben.com/version.txt');
      lastVersion = response.data;

      await RedisService.setLastVersion(lastVersion);
    }
  }

  return {
    lastVersion: lastVersion || null,
    apiVersion: packageFile.version,
    dockerImageVersion: process.env.DOCKER_IMAGE_VERSION || '',
  };
};
