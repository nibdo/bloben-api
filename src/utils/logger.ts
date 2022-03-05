import { LOG_LEVEL, LOG_TAG, NODE_ENV } from './enums';
import { env, winstonLogger } from '../index';

const logger = {
  info: async (message: string, tags?: LOG_TAG[]) => {
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

  warn: async (
    message: string,
    tags?: LOG_TAG[],
    method?: string,
    path?: string
  ) => {
    winstonLogger?.log({
      level: LOG_LEVEL.WARN,
      message,
      method,
      path,
      tags,
    });
  },

  debug: async (message: string, tags?: LOG_TAG[]) => {
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

  error: async (
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
      message: `${message}: ${error ? JSON.stringify(error) : ''}`,
      method,
      path,
      tags,
    });
  },
};

export default logger;
