import { initDatabase } from '../testHelpers/initDatabase';
import { mockRedisService } from '../__mocks__/RedisService';

export const mochaHooks = function () {
  return {
    async beforeAll() {
      mockRedisService();

      let count = 1;
      let isConnected = false;
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve: any, reject: any) => {
        while (count < 10 && !isConnected) {
          try {
            await initDatabase();
            // await initGlobalSeeds()

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
            // await initGlobalSeeds()
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
