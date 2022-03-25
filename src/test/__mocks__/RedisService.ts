import RedisService from '../../service/RedisService';

export const mockRedisService = () => {
  RedisService.setDavClientCache = (id: string, data: any) => {
    return Promise.resolve()
  };

  RedisService.getDavClientCache = (id: string) => {
    return Promise.resolve(undefined)
  };

  RedisService.deleteDavClientCache = (id: string) => {
    return Promise.resolve()
  };
};
