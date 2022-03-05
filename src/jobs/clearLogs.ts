import fs from 'fs';

import { DateTime } from 'luxon';

import { LOG_DIR } from '../utils/winston';
import { LOG_TAG } from '../utils/enums';
import { forEach } from 'lodash';
import logger from '../utils/logger';
import path from 'path';

const COMBINED_PREFIX = 'combined.log.';
const ERROR_PREFIX = 'error.log.';

export const getLogDateString = (fileName: string): string => {
  if (fileName.indexOf(COMBINED_PREFIX) !== -1) {
    return fileName.slice(COMBINED_PREFIX.length);
  } else {
    return fileName.slice(ERROR_PREFIX.length);
  }
};

export const getLogLevelFromFile = (fileName: string): string => {
  if (fileName.indexOf(COMBINED_PREFIX) !== -1) {
    return fileName.slice(0, COMBINED_PREFIX.length - 5);
  } else {
    return fileName.slice(0, ERROR_PREFIX.length - 5);
  }
};

export const clearLogs = async (): Promise<void> => {
  logger.info('Cleaning logs start', [LOG_TAG.CRON]);
  try {
    const files: any = fs.readdirSync(LOG_DIR);

    const dateSubThreeDays: DateTime = DateTime.now().minus({ days: 3 });

    forEach(files, (fileName) => {
      const dateString: string = getLogDateString(fileName);
      const fileDate: DateTime = DateTime.fromFormat(dateString, 'yyyy-MM-dd');

      // delete older files
      if (fileDate < dateSubThreeDays) {
        fs.unlinkSync(path.join(LOG_DIR, fileName));
      }
    });
  } catch (e) {
    logger.error('Cleaning logs error', e, [LOG_TAG.CRON]);
  }
};
