import { closeConnection } from '../testHelpers/closeConnection';
import { initDatabase } from '../testHelpers/initDatabase';
import {mockRedisService} from "../__mocks__/RedisService";

export const mochaHooks = function() {
  return {
    async beforeAll() {

      mockRedisService()

      let count = 1;
      let isConnected = false;
      return new Promise(async (resolve: any, reject: any) => {
        while (count < 10 && !isConnected) {
          try {
            await initDatabase();
            isConnected = true;

            resolve();
          } catch (e) {
            console.log(e)
            if (count >= 10) {
              reject();
            }
            count += 1;

            // eslint-disable-next-line no-console
            console.log(`Starting integration tests, attempt ${count}`);
            await initDatabase();
          }
        }
      });
    },
    async beforeEach() {
      await initDatabase();
    },
    async afterAll() {
      await closeConnection();
    }
  };
};
