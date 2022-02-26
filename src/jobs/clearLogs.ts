import fs from 'fs';

import { DateTime } from 'luxon';

import { LOG_DIR } from '../utils/winston';
import { forEach } from 'lodash';
import logger from '../utils/logger';
import path from 'path';

const COMBINED_PREFIX = 'combined.log.';
const ERROR_PREFIX = 'error.log.';

const getDateString = (fileName: string): string => {
  if (fileName.indexOf(COMBINED_PREFIX) !== -1) {
    return fileName.slice(COMBINED_PREFIX.length);
  } else {
    return fileName.slice(ERROR_PREFIX.length);
  }
};

export const clearLogs = async (): Promise<void> => {
  logger.info('[CRON]: Cleaning logs start');
  try {
    const files: any = fs.readdirSync(LOG_DIR);

    const dateSubThreeDays: DateTime = DateTime.now().minus({ days: 3 });

    forEach(files, (fileName) => {
      const dateString: string = getDateString(fileName);
      const fileDate: DateTime = DateTime.fromFormat(dateString, 'yyyy-MM-dd');

      // delete older files
      if (fileDate < dateSubThreeDays) {
        fs.unlinkSync(path.join(LOG_DIR, fileName));
      }
    });
  } catch (e) {
    logger.error('[CRON]: Cleaning logs error', e);
  }
};
