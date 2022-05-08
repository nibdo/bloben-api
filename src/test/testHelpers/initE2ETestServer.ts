import { default as Express } from 'express';
import { NextFunction, Request, Response } from 'express';
import { default as cors } from 'cors';
import bodyParser from 'body-parser';
import connect_redis from 'connect-redis';
import redis from 'redis';
import session from 'express-session';

import { SESSION } from '../../utils/enums';
import { corsOptions } from '../../config/cors';
import { createRedisConfig } from '../../config/redis';
import { createSessionConfig } from '../../config/session';
import { getTestUser } from './getTestUser';
import { redisClient } from '../../index';
import Router from '../../routes';
import UserEntity from '../../data/entity/UserEntity';
import errorMiddleware from '../../middleware/errorMiddleware';

const redisClientOriginal: any = redis.createClient();
const redisStore: any = connect_redis(session);
import asyncRedis from 'async-redis';
import { loadEnv } from '../../config/env';
import { testUserCalDavData } from '../e2e/seeds/1-user-caldav-seed';

loadEnv();

const testSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const testUser: UserEntity = await getTestUser(testUserCalDavData.username);

  if (testUser) {
    req.session[SESSION.USER_ID] = testUser.id;
    req.session[SESSION.ROLE] = testUser.role;
    req.session.save();
  }

  return next();
};

export const createE2ETestServerWithSession = () => {
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
  TestBlobenApp.use(testSessionMiddleware);
  TestBlobenApp.use('/api', Router);
  TestBlobenApp.use(errorMiddleware);

  return TestBlobenApp;
};
