import { Application, default as Express } from 'express';
import { default as cors } from 'cors';
import { corsOptions } from './config/cors';
import {
  createAdminSessionConfig,
  createSessionConfig,
} from './config/session';
import Router from './routes/appRoutes';
import bodyParser from 'body-parser';
import connect_redis from 'connect-redis';
import dotenv from 'dotenv';
import errorMiddleware from './middleware/errorMiddleware';
import http from 'http';
import session from 'express-session';

import { API_VERSIONS, NODE_ENV } from './utils/enums';
import { MemoryClient, initServices, initSocketService } from './service/init';
import { env } from './index';
import { initCronJobs } from './jobs/init';
import { initWebsockets } from './utils/websockets';
import AdminRoutes from './routes/adminRoutes';
import Logger from './utils/logger';
import PublicRouter from './routes/publicRoutes';
import helmet from 'helmet';

dotenv.config();

export let BlobenApp: Application | null;

export const createBlobenApp = () => {
  BlobenApp = null;
  BlobenApp = Express();

  const store = connect_redis(session);

  BlobenApp.use(helmet());
  BlobenApp.use(
    helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self'"],
        manifestSrc: ["'self'"],
        imgSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        styleSrc: ["'unsafe-inline'", "'self'"],
        connectSrc: [`"${env.appDomain}"`],
      },
    })
  );
  const adminSession = session(
    createAdminSessionConfig(store, MemoryClient.redisClient)
  );
  const userSession = session(
    createSessionConfig(store, MemoryClient.redisClient)
  );

  Logger.info('[INIT]: Session initialized');

  // for nginx
  if (env.nodeEnv !== NODE_ENV.DEVELOPMENT) {
    BlobenApp.set('trust proxy', 1);
  }
  BlobenApp.use(cors(corsOptions));

  BlobenApp.use(bodyParser.urlencoded({ extended: false }));
  BlobenApp.use(bodyParser.json({ limit: 1024 * 100 }));

  BlobenApp.use(`/api/app/${API_VERSIONS.V1}`, userSession, Router);

  BlobenApp.use(`/api/admin/${API_VERSIONS.V1}`, adminSession, AdminRoutes);
  BlobenApp.use(`/api/${API_VERSIONS.V1}/public`, PublicRouter);

  BlobenApp.use(errorMiddleware);

  Logger.info('[INIT]: App initialized');

  return BlobenApp;
};

const createApp = (): Promise<void> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    Logger.info(`[NODE_ENV]:  ${env.nodeEnv}`);

    await initServices();

    createBlobenApp();

    const server = http.createServer(BlobenApp);

    await initSocketService(undefined, server);

    if (env.nodeEnv !== NODE_ENV.TEST) {
      server.listen(env.port || 8080);
    }

    initWebsockets();

    initCronJobs();

    Logger.info(`[INIT]: Bloben Api listening at http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`[INIT]: Bloben Api listening at http://localhost:${env.port}`);

    resolve();
  });
};

export default createApp;
