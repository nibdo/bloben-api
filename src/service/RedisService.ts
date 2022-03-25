import { REDIS_PREFIX } from '../utils/enums';
import { redisClient } from '../index';

export default {
  setDavClientCache: async (
    accountID: string,
    clientData: { authHeaders: any; account: any }
  ) => {
    const key = `${REDIS_PREFIX.DAV_CLIENT}_${accountID}`;

    await redisClient.set(key, JSON.stringify(clientData), 'PX', 60 * 60 * 24); // 24 hours
  },
  getDavClientCache: async (accountID: string) => {
    const key = `${REDIS_PREFIX.DAV_CLIENT}_${accountID}`;

    const result = await redisClient.get(key);

    if (result) {
      return JSON.parse(result);
    }

    return null;
  },
  deleteDavClientCache: async (accountID: string) => {
    const key = `${REDIS_PREFIX.DAV_CLIENT}_${accountID}`;

    await redisClient.delete(key);
  },
};
