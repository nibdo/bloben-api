import 'winston-daily-rotate-file';
import * as os from 'os';
import * as winston from 'winston';
import { NODE_ENV } from './enums';
import { env } from '../index';
import { isElectron } from '../config/env';
import fs from 'fs';
import path from 'path';

const { format } = winston;

export const LOG_DIR = isElectron ? `${os.tmpdir()}/bloben_cache` : './logs';

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

  let transports;

  if (isElectron) {
    transports = [
      new winston.transports.File({
        filename: path.join(LOG_DIR, '/combined.log'),
      }),
    ];
  } else {
    transports = [
      new winston.transports.DailyRotateFile({
        filename: path.join(LOG_DIR, '/error.log'),
        level: 'error',
      }),
      new winston.transports.DailyRotateFile({
        filename: path.join(LOG_DIR, '/combined.log'),
      }),
    ];
  }

  return winston.createLogger({
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports,
  });
};
