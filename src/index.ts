import { Connection, createConnection } from 'typeorm';
import dotenv from 'dotenv';
import redis from 'redis';

import { Env, loadEnv } from './config/env';
import { LOG_TAG } from './utils/enums';
import { createORMConfig } from './config/ormconfig';
import { createRedisConfig } from './config/redis';
import { createWinstonLogger } from './utils/winston';
import createApp from './app';
import logger from './utils/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const asyncRedis = require('async-redis');

dotenv.config();

export let env: Env | null;

export let redisClient: any;
export let redisClientOriginal: any;
export let winstonLogger: any;

export const startServer = async (): Promise<void> => {
  try {
    // load env
    env = loadEnv();

    // connect to database
    const connection: Connection = await createConnection(createORMConfig());
    await connection.synchronize();
    await connection.runMigrations();

    winstonLogger = createWinstonLogger();

    // init redis
    const redisConfig: any = createRedisConfig();
    redisClient = asyncRedis.createClient(redisConfig);
    redisClientOriginal = redis.createClient(redisConfig);

    // create app
    await createApp();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    logger.error('Init error', err, [LOG_TAG.UNKNOWN]);
  }
};

process.on('uncaughtException', function (err) {
  logger.error('UncaughtException', err, [LOG_TAG.UNKNOWN]);
});

startServer();
