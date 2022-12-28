import { GetVersion } from 'bloben-interface';
import { env } from '../../../../index';
import RedisService from '../../../../service/RedisService';
import ServerSettingsRepository from '../../../../data/repository/ServerSettingsRepository';
import axios from 'axios';

export const getVersion = async (): Promise<GetVersion> => {
  let lastVersion = await RedisService.getLastVersion();
  let packageFile: any;

  if (!lastVersion) {
    const serverSettingsAll =
      await ServerSettingsRepository.getRepository().find();
    const serverSettings = serverSettingsAll?.[0];

    if (serverSettings.checkNewVersion || env.isElectron) {
      if (env.isElectron) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const packageElectron = require(__dirname +
            '/../../../../../../../package.json');
          lastVersion = packageElectron?.version;
          packageFile = require(__dirname + '/../../../../../package.json');
        } catch (e) {
          // eslint-disable-next-line no-console
          // console.log(e);
        }
      } else {
        const response = await axios.get('https://bloben.com/version.txt');
        lastVersion = response.data;

        packageFile = require('../../../../../package.json');

        await RedisService.setLastVersion(lastVersion);
      }
    }
  }

  return {
    lastVersion: lastVersion || null,
    apiVersion: packageFile?.version,
    dockerImageVersion: process.env.DOCKER_IMAGE_VERSION || '',
  };
};
