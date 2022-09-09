import { globalSeed } from './seeds/0-global-seed';
import { initDatabase } from '../testHelpers/initDatabase';
import { mockRedisService } from '../__mocks__/RedisService';
import { mockSocketio } from '../__mocks__/socketio';

export const mochaHooks = function () {
  return {
    async beforeAll() {
      mockSocketio();
      mockRedisService();

      let count = 1;
      let isConnected = false;
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve: any, reject: any) => {
        while (count < 10 && !isConnected) {
          try {
            await initDatabase();
            await globalSeed();

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
            console.log(`Starting integration tests, attempt ${count}`);

            await initDatabase();
            await globalSeed();
          }
        }
      });
    },
    async beforeEach() {
      // await initDatabase();
    },
    async afterAll() {
      // await dropDatabase()
      // await closeConnection();
    },
  };
};
