/* eslint-disable @typescript-eslint/no-unused-vars */
import RedisService from '../../service/RedisService';

export const mockRedisService = () => {
  RedisService.setLastVersion = (version: string) => {
    return Promise.resolve();
  };

  RedisService.getLastVersion = () => {
    return Promise.resolve('0.0.1');
  };

  RedisService.setDavClientCache = (id: string, data: any) => {
    return Promise.resolve();
  };

  RedisService.getDavClientCache = (id: string) => {
    return Promise.resolve(undefined);
  };

  RedisService.deleteDavClientCache = (id: string) => {
    return Promise.resolve();
  };
};
