import { LOG_LEVEL, NODE_ENV } from './enums';
import { env, winstonLogger } from '../index';

const logger: any = {
  info: async (message: string) => {
    if (env.nodeEnv === NODE_ENV.DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(message);
    }

    winstonLogger?.log({
      level: LOG_LEVEL.INFO,
      message,
    });
  },

  warn: async (message: string, method: string, path: string) => {
    winstonLogger?.log({
      level: LOG_LEVEL.WARN,
      message,
      method,
      path,
    });
  },

  debug: async (message: string) => {
    winstonLogger?.log({
      level: LOG_LEVEL.DEBUG,
      message,
    });
  },

  error: async (
    message: string,
    error?: any,
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
    });
  },
};

export default logger;
