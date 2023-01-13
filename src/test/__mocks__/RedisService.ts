/* eslint-disable @typescript-eslint/no-unused-vars */
import { MemoryClient } from '../../service/init';
import { MemoryDbService } from '../../service/MemoryDbService';
import { createRedisConfig } from '../../config/redis';
import { isElectron } from '../../config/env';
import Redis from 'ioredis';
import RedisService from '../../service/RedisService';

export const mockRedisService = () => {
  if (!MemoryClient) {
    // @ts-ignore
    MemoryClient = new MemoryDbService();
  }

  if (!isElectron) {
    const redisConfig: any = createRedisConfig();
    MemoryClient.redisClient = new Redis(redisConfig);
  } else {
    MemoryClient.redisClient = {
      set: async (key: string, value: string) => Promise.resolve(),
      get: async (key: string) => Promise.resolve(''),
      del: async (key: string) => Promise.resolve(),
    } as any;
  }

  MemoryClient.get = async (key: string) => Promise.resolve('');
  MemoryClient.set = async (key: string, value: string) => Promise.resolve();
  MemoryClient.del = async (key: string) => Promise.resolve();

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
