import { ImportMock } from 'ts-mock-imports';
import { closeConnection } from '../testHelpers/closeConnection';
import { initDatabase } from '../testHelpers/initDatabase';
import { mockBullQueue } from '../__mocks__/bullQueue';
import { mockRedisService } from '../__mocks__/RedisService';
import { mockSocketio } from '../__mocks__/socketio';

export const mochaHooks = function () {
  return {
    async beforeAll() {
      ImportMock.restore();

      mockSocketio();
      mockRedisService();
      mockBullQueue();

      await initDatabase();
    },
    async afterAll() {
      await closeConnection();
    },
  };
};
