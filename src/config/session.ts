import { Cookie } from 'express-session';
import { NODE_ENV } from '../utils/enums';
import { env } from '../index';

export const createSessionConfig = (redisStore: any, redisClient: any) => {
  const cookie: Cookie = {
    path: '/',
    originalMaxAge: 600000000,
    maxAge: 600000000,
    sameSite: !!process.env.COOKIE_SAME_SITE || false,
    httpOnly: !!process.env.COOKIE_HTTP_ONLY || true,
    secure: !!process.env.COOKIE_SECURE || false,
  };

  return {
    cookieName: 'session',
    username: null,
    userID: null,
    sessionId: null,
    user: null,
    isLogged: false,
    secret: env.secret.sessionSecret,
    duration: 24 * 60 * 60 * 100000,
    activeDuration: 100000 * 60 * 5,
    saveUninitialized: false,
    resave: false,
    rolling: true,
    proxy: env.nodeEnv === NODE_ENV.PRODUCTION,
    cookie,
    store: new redisStore({
      host: env.redis.host,
      port: env.redis.port,
      client: redisClient,
      ttl: 86400,
    }),
  };
};
