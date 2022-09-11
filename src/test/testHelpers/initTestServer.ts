import { default as Express, NextFunction, Request, Response } from 'express';
import { default as cors } from 'cors';
import Redis from 'ioredis';
import bodyParser from 'body-parser';
import connect_redis from 'connect-redis';
import session from 'express-session';

import { API_VERSIONS, SESSION } from '../../utils/enums';
import { corsOptions } from '../../config/cors';
import {
  createAdminSessionConfig,
  createSessionConfig,
} from '../../config/session';
import { createRedisConfig } from '../../config/redis';
import { env } from '../../index';
import { getTestUser } from './getTestUser';
import Router from '../../routes/appRoutes';
import UserEntity from '../../data/entity/UserEntity';
import errorMiddleware from '../../middleware/errorMiddleware';

let redisClient = new Redis();
const redisStore: any = connect_redis(session);
import { Server } from 'socket.io';
import { initBullQueue } from '../../service/BullQueue';
import { loadEnv } from '../../config/env';
import AdminRoutes from '../../routes/adminRoutes';
import PublicRouter from '../../routes/publicRoutes';

loadEnv();
export let io: Server = null;

export const testSessionMiddleware = (
  id: string
): ((req: Request, res: Response, next: NextFunction) => any) => {
  return async (req, res, next) => {
    const testUser: UserEntity = await getTestUser(id);

    if (testUser) {
      req.session[SESSION.USER_ID] = testUser.id;
      req.session[SESSION.ROLE] = testUser.role;
      req.session.save();
    }

    return next();
  };
};

export const createTestServerWithSession = (userID: string) => {
  loadEnv();
  const redisConfig: any = createRedisConfig();
  redisClient = new Redis(redisConfig);
  const TestBlobenApp: any = Express();
  TestBlobenApp.use(cors(corsOptions));

  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());

  const adminSession = session(
    createAdminSessionConfig(redisStore, redisClient)
  );
  const appSession = session(createSessionConfig(redisStore, redisClient));

  TestBlobenApp.use(
    '/api/admin/v1',
    adminSession,
    testSessionMiddleware(userID),
    AdminRoutes
  );

  TestBlobenApp.use(
    '/api/app/v1',
    appSession,
    testSessionMiddleware(userID),
    Router
  );

  TestBlobenApp.use(errorMiddleware);

  initBullQueue();

  // temp mock for socketio
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  io = {
    to: () => {
      return {
        emit: () => {
          return;
        },
      };
    },
  };

  env.email = {
    smtpHost: 'smtp.bloben.com',
    smtpPort: 587,
    username: 'asafsaf',
    password: 'asfafasf',
    identity: 'asfasf',
  };

  return TestBlobenApp;
};

export const createTestServer = () => {
  const redisConfig: any = createRedisConfig();
  redisClient = new Redis(redisConfig);

  const TestBlobenApp = Express();
  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());
  TestBlobenApp.use(
    '/api/app/v1',
    session(createSessionConfig(redisStore, redisClient)),
    Router
  );
  TestBlobenApp.use(`/api/${API_VERSIONS.V1}/public`, PublicRouter);
  TestBlobenApp.use(
    '/api/admin/v1',
    session(createAdminSessionConfig(redisStore, redisClient)),
    AdminRoutes
  );

  TestBlobenApp.use(errorMiddleware);

  return TestBlobenApp;
};
