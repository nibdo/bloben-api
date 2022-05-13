import { LOG_LEVEL, LOG_TAG, NODE_ENV } from './enums';
import { env, redisClient, winstonLogger } from '../index';

const logger = {
  info: (message: string, tags?: LOG_TAG[]) => {
    if (env.nodeEnv === NODE_ENV.DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(message);
    }

    winstonLogger?.log({
      level: LOG_LEVEL.INFO,
      message,
      tags,
    });
  },

  warn: (message: string, tags?: LOG_TAG[], method?: string, path?: string) => {
    winstonLogger?.log({
      level: LOG_LEVEL.WARN,
      message,
      method,
      path,
      tags,
    });
  },

  debug: (message: string, tags?: LOG_TAG[]) => {
    if (env.nodeEnv === NODE_ENV.DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(message);
    }

    winstonLogger?.log({
      level: LOG_LEVEL.DEBUG,
      message,
      tags,
    });
  },

  error: (
    message: string,
    error?: any,
    tags?: LOG_TAG[],
    method?: string,
    path?: string
  ) => {
    if (env.nodeEnv === NODE_ENV.DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(message, error);
    }

    winstonLogger?.log({
      level: LOG_LEVEL.ERROR,
      message: `${message}: ${JSON.stringify(error)}`,
      method,
      path,
      tags,
    });
  },
};

export const groupLogs = async (key: string, msg: string) => {
  if (env.nodeEnv === NODE_ENV.TEST) {
    return;
  }
  const resultRaw = await redisClient.get(key);
  const result = resultRaw ? JSON.parse(resultRaw) : [];

  if (env.nodeEnv === NODE_ENV.DEVELOPMENT) {
    // eslint-disable-next-line no-console
    console.log(`[GROUP LOG]: ${key} - ${msg}`);
  }

  result.push({
    timestamp: new Date().toISOString(),
    message: msg,
  });

  await redisClient.set(key, JSON.stringify(result));
};

export default logger;
