import { MemoryClient } from './init';
import { REDIS_PREFIX } from '../utils/enums';

export default {
  setLastVersion: async (version: string) => {
    const key = `${REDIS_PREFIX.DOCKER_LAST_VERSION}`;

    await MemoryClient.set(key, version, 'EX', 60 * 60 * 4); // 4 hours
  },
  getLastVersion: async (): Promise<string> => {
    const key = `${REDIS_PREFIX.DOCKER_LAST_VERSION}`;

    return MemoryClient.get(key);
  },
  setDavClientCache: async (
    accountID: string,
    clientData: { authHeaders: any; account: any }
  ) => {
    const key = `${REDIS_PREFIX.DAV_CLIENT}_${accountID}`;

    await MemoryClient.set(key, JSON.stringify(clientData), 'EX', 60 * 60 * 24); // 24 hours
  },
  getDavClientCache: async (accountID: string) => {
    const key = `${REDIS_PREFIX.DAV_CLIENT}_${accountID}`;

    const result = await MemoryClient.get(key);

    if (result) {
      return JSON.parse(result);
    }

    return null;
  },
  deleteDavClientCache: async (accountID: string) => {
    const key = `${REDIS_PREFIX.DAV_CLIENT}_${accountID}`;

    await MemoryClient.del(key);
  },
};

export const getTrustedBrowserRedisKey = (
  type: REDIS_PREFIX.BROWSER_ID_ADMIN | REDIS_PREFIX.BROWSER_ID_APP,
  userID: string,
  browserID: string
) => `${type}_${userID}_${browserID}`;
