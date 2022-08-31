import { Application, default as Express } from 'express';
import { Server } from 'socket.io';
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
import { createSocketOptions } from './config/socketio';
import { env, redisClientOriginal } from './index';
import { initBullQueue } from './service/BullQueue';
import { initCronJobs } from './jobs/init';
import { initWebsockets } from './utils/websockets';
import AdminRoutes from './routes/adminRoutes';
import PublicRouter from './routes/publicRoutes';
import helmet from 'helmet';

dotenv.config();

export let BlobenApp: Application | null;

const createBlobenApp = () => {
  BlobenApp = null;
  BlobenApp = Express();

  const redisStore: any = connect_redis(session);

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

  const userSession = session(
    createSessionConfig(redisStore, redisClientOriginal)
  );
  const adminSession = session(
    createAdminSessionConfig(redisStore, redisClientOriginal)
  );

  // for nginx
  if (env.nodeEnv !== NODE_ENV.DEVELOPMENT) {
    BlobenApp.set('trust proxy', 1);
  }
  BlobenApp.use(cors(corsOptions));

  BlobenApp.use(bodyParser.urlencoded({ extended: false }));
  BlobenApp.use(bodyParser.json({ limit: 1024 * 100 }));

  BlobenApp.use(`/api/admin/${API_VERSIONS.V1}`, adminSession, AdminRoutes);
  BlobenApp.use(`/api/app/${API_VERSIONS.V1}`, userSession, Router);
  BlobenApp.use(`/api/${API_VERSIONS.V1}/public`, PublicRouter);

  BlobenApp.use(errorMiddleware);

  return BlobenApp;
};

export let io: Server = null;

const createApp = (): Promise<void> => {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-console
    console.log(`[NODE_ENV]:  ${env.nodeEnv}`);

    // if (env.nodeEnv === NODE_ENV.DEVELOPMENT) {
    //   coverageTestUtil();
    // }

    createBlobenApp();
    const server = http.createServer(BlobenApp);

    if (env.nodeEnv !== NODE_ENV.TEST) {
      server.listen(env.port);
    }
    io = new Server(server, createSocketOptions());
    initWebsockets();

    // eslint-disable-next-line no-console
    console.log(`Bloben Api listening at http://localhost:${env.port}`);

    initCronJobs();

    initBullQueue();

    resolve();
  });
};

export default createApp;
