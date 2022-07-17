import { default as Express } from 'express';
import { NextFunction, Request, Response } from 'express';
import { default as cors } from 'cors';
import bodyParser from 'body-parser';
import connect_redis from 'connect-redis';
import redis from 'redis';
import session from 'express-session';

import { API_VERSIONS, SESSION } from '../../utils/enums';
import { corsOptions } from '../../config/cors';
import { createRedisConfig } from '../../config/redis';
import { createSessionConfig } from '../../config/session';
import {getTestDemoUser, getTestUser} from './getTestUser';
import {BlobenApp, io} from '../../app';
import {env, redisClient} from '../../index';
import Router from '../../routes';
import UserEntity from '../../data/entity/UserEntity';
import errorMiddleware from '../../middleware/errorMiddleware';

const redisClientOriginal: any = redis.createClient();
const redisStore: any = connect_redis(session);
import asyncRedis from 'async-redis';
import { initBullQueue } from '../../service/BullQueue';
import { loadEnv } from '../../config/env';
import AdminRoutes from '../../routes/adminRoutes';
import PublicRouter from "../../routes/publicRoutes";

loadEnv();

const testSessionMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  const testUser: UserEntity = await getTestUser();

  if (testUser) {
    req.session[SESSION.USER_ID] = testUser.id;
    req.session[SESSION.ROLE] = testUser.role;
    req.session.save();
  }

  return next();
};
const testSessionDemoUserMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  const testUser: UserEntity = await getTestDemoUser();

  if (testUser) {
    req.session[SESSION.USER_ID] = testUser.id;
    req.session[SESSION.ROLE] = testUser.role;
    req.session.save();
  }

  return next();
};

export const createTestServerWithSession = (isDemoUser?: boolean) => {
  loadEnv();
  const redisConfig: any = createRedisConfig();
  // @ts-ignore
  redisClient = asyncRedis.createClient(redisConfig);

  const TestBlobenApp: any = Express();
  TestBlobenApp.use(cors(corsOptions));
  // Set session settings
  TestBlobenApp.use(
      session(createSessionConfig(redisStore, redisClientOriginal))
  );

  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());
  TestBlobenApp.use(isDemoUser ? testSessionDemoUserMiddleware : testSessionMiddleware);
  TestBlobenApp.use('/api', Router);
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
    identity: 'asfasf'
  }

  return TestBlobenApp;
};

export const createAdminTestServerWithSession = () => {
  loadEnv();
  const redisConfig: any = createRedisConfig();
  // @ts-ignore
  redisClient = asyncRedis.createClient(redisConfig);

  const TestBlobenApp: any = Express();
  TestBlobenApp.use(cors(corsOptions));

  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());
  TestBlobenApp.use(`/api/${API_VERSIONS.V1}/admin`, AdminRoutes);
  TestBlobenApp.use('/api', Router);
  TestBlobenApp.use(errorMiddleware);

  return TestBlobenApp;
};

export const createTestServer = () => {
  const redisConfig: any = createRedisConfig();
  // @ts-ignore
  redisClient = asyncRedis.createClient(redisConfig);
  const TestBlobenApp = Express();
  TestBlobenApp.use(
      session(createSessionConfig(redisStore, redisClientOriginal))
  );
  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());
  TestBlobenApp.use('/api', Router);
  TestBlobenApp.use(`/api/${API_VERSIONS.V1}/public`, PublicRouter);

  TestBlobenApp.use(errorMiddleware);

  return TestBlobenApp;
};
