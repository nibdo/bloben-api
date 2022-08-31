import { Request } from 'express';
import { forEach } from 'lodash';

import { LOG_DIR } from '../../../../utils/winston';
import { Log } from '../../../../bloben-interface/interface';
import {
  getLogDateString,
  getLogLevelFromFile,
} from '../../../../jobs/clearLogs';
import fs from 'fs';

export const getLogs = async (req: Request): Promise<Log[]> => {
  const { level, date, tags } = req.query;

  const parsedTags = tags ? JSON.parse(tags as string) : undefined;

  let logs: Log[] = [];

  let selectedFile: string | null = null;

  // get log file
  const files: any = fs.readdirSync(LOG_DIR);
  forEach(files, (fileName) => {
    const fileDate = getLogDateString(fileName);
    const fileLogLevel = getLogLevelFromFile(fileName);

    if (fileDate === date && fileLogLevel === level) {
      selectedFile = fileName;
    }
  });

  let fileJSON = '[';
  let fileContent = fs.readFileSync(`${LOG_DIR}/${selectedFile}`, 'utf8');
  const fileContentArray = fileContent.split('\n');
  fileContent = fileContentArray.join(',');
  fileJSON += fileContent.slice(0, fileContent.length - 1);
  fileJSON += ']';
  fileJSON = JSON.parse(fileJSON);

  if (parsedTags) {
    forEach(fileJSON, (item: any) => {
      if (parsedTags) {
        forEach(item?.tags, (itemTag) => {
          if (parsedTags.includes(itemTag)) {
            logs.push(item);
          }
        });
      }
    });
  } else {
    logs = fileJSON as unknown as Log[];
  }

  return logs;
};
