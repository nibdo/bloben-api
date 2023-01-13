import { createRedisConfig } from '../config/redis';
import Redis from 'ioredis';

interface MemoryItem {
  value: string;
  expire?: any; // string
  expireAt?: number;
}

interface MemoryStore {
  [key: string]: MemoryItem;
}

export class MemoryDbService {
  protected isElectron = false;
  public redisClient: Redis | undefined;
  private store: MemoryStore = {};

  constructor(isElectron?: boolean) {
    if (isElectron) {
      this.isElectron = true;
    } else {
      this.redisClient = new Redis(createRedisConfig());
    }
  }

  public async get(key: string) {
    if (this.isElectron) {
      return this.store[key]?.value;
    } else if (this.redisClient) {
      return this.redisClient.get(key);
    }
  }

  public async set(
    key: string,
    value: string,
    expire?: any, // string
    expireAt?: number
  ) {
    if (this.isElectron) {
      const obj: MemoryItem = { value };

      if (expire && expireAt) {
        obj.expire = expire;
        obj.expireAt = expireAt;
      }

      this.store[key] = obj;
    } else if (this.redisClient) {
      if (expire) {
        await this.redisClient.set(key, value, expire, expireAt);
      } else {
        await this.redisClient.set(key, value);
      }
    }
  }

  public async del(key: string) {
    if (this.isElectron) {
      this.store[key] = undefined;
    } else if (this.redisClient) {
      await this.redisClient.del(key);
    }
  }
}
