import { Connection, createConnection } from 'typeorm';
import dotenv from 'dotenv';

import { Env, isElectron, loadEnv } from './config/env';
import { LOG_LEVEL, LOG_TAG, NODE_ENV } from './utils/enums';
import { createORMConfig } from './config/ormconfig';
import { createWinstonLogger } from './utils/winston';
import createApp from './app';
import logger from './utils/logger';

dotenv.config();

export let env: Env | null;

export let winstonLogger: any;

const checkIfDatabaseWasCreated = async () => {
  if (process.env.NODE_ENV === NODE_ENV.TEST) {
    return false;
  }

  let wasSynced = false;

  const initConnection = await createConnection(createORMConfig());
  try {
    const dbResult = await initConnection.query(
      `SELECT id from server_settings`
    );
    if (dbResult?.length) {
      wasSynced = true;
    }
  } catch (e) {
    if (e.message === 'SQLITE_ERROR: no such table: server_settings') {
      logger?.info('[DATABASE]: Initial sync SQLITE database');
    }
  }

  await initConnection.destroy();

  return wasSynced;
};

/**
 * Don't import any app logic or functions might not be initialized properly
 */

export const startServer = async (): Promise<void> => {
  try {
    env = loadEnv();

    logger?.info(`[INIT]: APP TYPE: ${isElectron ? 'ELECTRON' : 'WEB'}`);

    // check if database is set
    const wasSynced = await checkIfDatabaseWasCreated();

    // connect to database
    const connection: Connection = await createConnection(createORMConfig());

    if (!wasSynced) {
      await connection.synchronize();
    }

    if (env.nodeEnv !== NODE_ENV.TEST) {
      logger?.info('[DATABASE]: Running migrations');
      await connection.runMigrations();
    }

    logger?.info('[DATABASE]: Synchronize database');
    await connection.synchronize();

    winstonLogger = createWinstonLogger();

    winstonLogger.log({
      level: LOG_LEVEL.INFO,
      message: 'TEST',
    });

    // create app
    await createApp();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    logger?.error('Init error', err, [LOG_TAG.UNKNOWN]);
  }
};

process.on('uncaughtException', function (err) {
  logger?.error('UncaughtException', err, [LOG_TAG.UNKNOWN]);
});

startServer();
