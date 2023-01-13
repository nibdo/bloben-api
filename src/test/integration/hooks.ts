import { closeConnection } from '../testHelpers/closeConnection';
import { globalSeed } from './seeds/global-seed';
import { initDatabase } from '../testHelpers/initDatabase';
import { isElectron } from '../../config/env';
import { mockRedisService } from '../__mocks__/RedisService';
import { mockSocketio } from '../__mocks__/socketio';
import { mockTsDav } from '../__mocks__/tsdav';

export const mochaHooks = function () {
  return {
    async beforeAll() {
      mockSocketio();
      mockRedisService();
      mockTsDav();

      await initDatabase();

      if (!isElectron) {
        await globalSeed();
      }
    },
    async afterAll() {
      await closeConnection();
    },
    // async beforeEach() {
    //   await initDatabase();
    // },
    // async afterEach() {
    //   await closeConnection();
    // },
  };
};
