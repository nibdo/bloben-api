import { ImportMock } from 'ts-mock-imports';
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

      let count = 1;
      let isConnected = false;
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve: any, reject: any) => {
        while (count < 10 && !isConnected) {
          try {
            await initDatabase();
            isConnected = true;

            resolve();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            if (count >= 10) {
              reject();
            }
            count += 1;

            // eslint-disable-next-line no-console
            console.log(`Starting e2e tests, attempt ${count}`);
            await initDatabase();
          }
        }
      });
    },
    async afterAll() {
      // await closeConnection();
    },
  };
};
