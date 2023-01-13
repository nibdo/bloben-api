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
import { getTestUser } from './getTestUser';
import Router from '../../routes/appRoutes';
import UserEntity from '../../data/entity/UserEntity';
import errorMiddleware from '../../middleware/errorMiddleware';

let redisClient = new Redis();
const redisStore: any = connect_redis(session);
import { Server } from 'socket.io';
import { Settings } from 'luxon';
import { electronMiddleware } from '../../middleware/electronMiddleware';
import { initBullQueue } from '../../service/BullQueue';
import { initServices, initSocketService } from '../../service/init';
import { initWebsockets } from '../../utils/websockets';
import { isElectron, loadEnv } from '../../config/env';
import AdminRoutes from '../../routes/adminRoutes';
import ElectronRouter from '../../routes/electronRoutes';
import PublicRouter from '../../routes/publicRoutes';

const env = loadEnv();
export const io: Server = null;

const createElectronTestApp = (userID: string) => {
  const BlobenApp = Express();

  BlobenApp.use(bodyParser.urlencoded({ extended: false }));
  BlobenApp.use(bodyParser.json());
  BlobenApp.use(`/api/electron/${API_VERSIONS.V1}`, ElectronRouter);
  BlobenApp.use(
    `/api/app/${API_VERSIONS.V1}`,
    [testElectronMiddleware(userID), testSessionMiddleware(userID)],
    Router
  );

  BlobenApp.use(errorMiddleware);

  Settings.defaultZone = 'utc';

  initServices();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initSocketService(() => {});

  return BlobenApp;
};

const createElectronTestAppNoUser = () => {
  const BlobenApp = Express();

  BlobenApp.use(bodyParser.urlencoded({ extended: false }));
  BlobenApp.use(bodyParser.json());
  BlobenApp.use(`/api/electron/${API_VERSIONS.V1}`, ElectronRouter);
  BlobenApp.use(
    `/api/app/${API_VERSIONS.V1}`,
    [electronEmptyMiddleware],
    Router
  );

  BlobenApp.use(errorMiddleware);

  Settings.defaultZone = 'utc';

  initServices();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initSocketService(() => {});

  return BlobenApp;
};

const electronEmptyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.headers = {};
    req.headers['content-type'] = 'Application/JSON';

    res.contentType('Application/JSON');

    // @ts-ignore
    req.session = {
      // @ts-ignore
      save: () => {
        return 'ok';
      },
    };

    return next();
  } catch (e) {
    next(e);
  }
};

export const testSessionMiddleware = (
  id: string
): ((req: Request, res: Response, next: NextFunction) => any) => {
  return async (req, res, next) => {
    const testUser: UserEntity = await getTestUser(id);

    if (testUser) {
      req.session[SESSION.USER_ID] = testUser.id;
      req.session[SESSION.ROLE] = testUser.role;
      req.session?.save();
    }

    return next();
  };
};

export const testElectronMiddleware = (
  id: string
): ((req: Request, res: Response, next: NextFunction) => any) => {
  return async (req, res, next) => {
    const testUser: UserEntity = await getTestUser(id);

    if (testUser) {
      res.locals.userID = testUser.id;
      res.locals.user = testUser;
    }

    // @ts-ignore
    req.session = {
      // @ts-ignore
      save: () => 'Ok',
    };

    return next();
  };
};

export const createTestServerWithSession = (userID: string) => {
  if (isElectron) {
    return createElectronTestApp(userID);
  }
  // initServices();
  initWebsockets();

  const redisConfig: any = createRedisConfig();
  if (!isElectron) {
    redisClient = new Redis(redisConfig);
  }
  const TestBlobenApp: any = Express();
  TestBlobenApp.use(cors(corsOptions));

  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());

  const adminSession = !isElectron
    ? session(createAdminSessionConfig(redisStore, redisClient))
    : undefined;
  const appSession = !isElectron
    ? session(createSessionConfig(redisStore, redisClient))
    : undefined;

  if (isElectron) {
    TestBlobenApp.use(
      `/api/app/${API_VERSIONS.V1}`,
      [electronMiddleware, testSessionMiddleware(userID)],
      Router
    );
  } else {
    TestBlobenApp.use(
      '/api/app/v1',
      appSession,
      testSessionMiddleware(userID),
      Router
    );
  }

  if (!isElectron) {
    TestBlobenApp.use(
      '/api/admin/v1',
      adminSession,
      testSessionMiddleware(userID),
      AdminRoutes
    );
  }

  TestBlobenApp.use(errorMiddleware);

  initBullQueue();

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
  if (isElectron) {
    return createElectronTestAppNoUser();
  }
  const redisConfig: any = createRedisConfig();
  if (!isElectron) {
    redisClient = new Redis(redisConfig);
  }
  // initServices();
  initWebsockets();

  const TestBlobenApp = Express();
  TestBlobenApp.use(bodyParser.urlencoded({ extended: false }));
  TestBlobenApp.use(bodyParser.json());

  if (isElectron) {
    TestBlobenApp.use('/api/app/v1', electronEmptyMiddleware, Router);
  } else {
    TestBlobenApp.use(
      '/api/app/v1',
      session(createSessionConfig(redisStore, redisClient)),
      Router
    );
  }

  TestBlobenApp.use(`/api/${API_VERSIONS.V1}/public`, PublicRouter);

  if (!isElectron) {
    TestBlobenApp.use(
      '/api/admin/v1',
      session(createAdminSessionConfig(redisStore, redisClient)),
      AdminRoutes
    );
  }

  TestBlobenApp.use(errorMiddleware);

  return TestBlobenApp;
};
