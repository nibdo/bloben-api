import { default as Express, NextFunction, Request, Response } from 'express';
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
import Router from '../../routes/appRoutes';
import UserEntity from '../../data/entity/UserEntity';
import errorMiddleware from '../../middleware/errorMiddleware';

const redisClientOriginal: any = redis.createClient();
const redisStore: any = connect_redis(session);
import { loadEnv } from '../../config/env';
import asyncRedis from 'async-redis';

loadEnv();

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

export const createE2ETestServerWithSession = (userID: string) => {
  loadEnv();
  const redisConfig: any = createRedisConfig();
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redisClient = asyncRedis.createClient(redisConfig);

  const TestBlobenApp: any = Express();
  TestBlobenApp.use(cors(corsOptions));
  // Set session settings
  TestBlobenApp.use(
    session(createSessionConfig(redisStore, redisClientOriginal))
  );

  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());
  TestBlobenApp.use(testSessionMiddleware(userID));
  TestBlobenApp.use('/api/app/v1', Router);
  TestBlobenApp.use(errorMiddleware);

  return TestBlobenApp;
};
