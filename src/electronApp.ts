import { default as Express } from 'express';
import Router from './routes/appRoutes';
import dotenv from 'dotenv';
import errorMiddleware from './middleware/errorMiddleware';

import { API_VERSIONS } from './utils/enums';
import { Connection, createConnection } from 'typeorm';
import { Env, isElectron, loadEnv } from './config/env';
import { Settings } from 'luxon';
import { createORMConfig } from './config/ormconfig';
import { createWinstonLogger } from './utils/winston';
import { electronMiddleware } from './middleware/electronMiddleware';
import { initElectronCronJobs } from './jobs/initElectron';
import { initServices, initSocketService } from './service/init';
import ElectronRouter from './routes/electronRoutes';
import Logger from './utils/logger';

dotenv.config();

export let env: Env | null;

export let winstonLogger: any;

export const createElectronApp = async (msgCallback: any) => {
  env = loadEnv();

  winstonLogger = createWinstonLogger();

  Logger?.info(`[INIT]: APP TYPE: ${isElectron ? 'ELECTRON' : 'WEB'}`);

  // connect to database
  const connection: Connection = await createConnection(createORMConfig());

  await connection.synchronize();

  Logger?.info('[DATABASE]: Running migrations');
  await connection.runMigrations();

  Logger?.info('[DATABASE]: Synchronize database');
  await connection.synchronize();

  Logger?.info(`[DATABASE]: Setting database to ${env?.database?.database}`);

  const BlobenApp = Express();

  Logger.info('[INIT]: Session initialized');

  BlobenApp.use(`/api/electron/${API_VERSIONS.V1}`, ElectronRouter);

  BlobenApp.use(`/api/app/${API_VERSIONS.V1}`, [electronMiddleware], Router);

  BlobenApp.use(errorMiddleware);

  Settings.defaultZone = 'utc';

  await initServices();

  initSocketService(msgCallback);

  await initElectronCronJobs();

  return BlobenApp;
};
