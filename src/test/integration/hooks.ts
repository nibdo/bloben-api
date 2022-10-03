import { closeConnection } from '../testHelpers/closeConnection';
import { globalSeed } from './seeds/0-global-seed';
import { initDatabase } from '../testHelpers/initDatabase';
import { mockRedisService } from '../__mocks__/RedisService';
import { mockSocketio } from '../__mocks__/socketio';

export const mochaHooks = function () {
  return {
    async beforeAll() {
      mockSocketio();
      mockRedisService();

      await initDatabase();
      await globalSeed();
    },
    async afterAll() {
      await closeConnection();
    },
  };
};
