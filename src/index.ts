import { Connection, createConnection } from 'typeorm';
import dotenv from 'dotenv';

import { Env, loadEnv } from './config/env';
import { LOG_TAG } from './utils/enums';
import { createORMConfig } from './config/ormconfig';
import { createRedisConfig } from './config/redis';
import { createWinstonLogger } from './utils/winston';
import Redis from 'ioredis';
import createApp from './app';
import logger from './utils/logger';

dotenv.config();

export let env: Env | null;

// init redis
const redisConfig = createRedisConfig();
export const redisClient = new Redis(redisConfig);

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
