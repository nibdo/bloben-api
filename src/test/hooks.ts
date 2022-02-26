import { closeConnection } from './utils/closeConnection';
import { initDatabase } from './utils/initDatabase';

export const mochaHooks = function() {
  return {
    async beforeAll() {

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
            console.log(`Starting tests, attempt ${count}`);
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
