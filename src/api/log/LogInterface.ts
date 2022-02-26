import { APP_TYPE, LOG_LEVEL } from '../../utils/enums';

export interface GetLogsResponse {
  id: string;
  level: LOG_LEVEL;
  message: string;
  method: string;
  path: string;
  appType: APP_TYPE;
  timestamp: string;
}
