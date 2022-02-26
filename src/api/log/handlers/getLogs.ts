/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { map } from 'lodash';

import { GetLogsResponse } from '../LogInterface';

export const getLogs = async (req: Request): Promise<GetLogsResponse[]> => {
  const { page, limit } = req.query;

  const logs = [];

  return map(logs, (log) => ({
    id: log._id,
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
    method: log.method,
    path: log.path,
    appType: log.appType,
  }));
};
