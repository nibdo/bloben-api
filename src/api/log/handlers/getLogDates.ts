import { forEach } from 'lodash';

import { DateTime } from 'luxon';
import { LOG_DIR } from '../../../utils/winston';
import { getLogDateString } from '../../../jobs/clearLogs';
import fs from 'fs';

export const getLogDates = async (): Promise<string[]> => {
  const files: any = fs.readdirSync(LOG_DIR);

  const dates: string[] = [];

  forEach(files, (fileName) => {
    const dateString: string = getLogDateString(fileName);

    if (!dates.includes(dateString)) {
      dates.push(dateString);
    }
  });

  return dates.sort(
    (a, b) =>
      DateTime.fromFormat(b, 'yyyy-MM-dd').toMillis() -
      DateTime.fromFormat(a, 'yyyy-MM-dd').toMillis()
  );
};
