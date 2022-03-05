import 'winston-daily-rotate-file';
import * as winston from 'winston';
import { NODE_ENV } from './enums';
import { env } from '../index';
import fs from 'fs';
import path from 'path';

const { format } = winston;

export const LOG_DIR = './logs';

export const createWinstonLogger = (forceCreate?: boolean) => {
  if (env.nodeEnv === NODE_ENV.TEST && !forceCreate) {
    return {
      log: () => {
        return;
      },
      info: () => {
        return;
      },
      warn: () => {
        return;
      },
      error: () => {
        return;
      },
    };
  }

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }

  return winston.createLogger({
    // level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        filename: path.join(LOG_DIR, '/error.log'),
        level: 'error',
      }),
      new winston.transports.DailyRotateFile({
        filename: path.join(LOG_DIR, '/combined.log'),
      }),
    ],
  });
};
