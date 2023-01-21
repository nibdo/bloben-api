import { loadEnv } from '../config/env';

export const EVENT_MAX_REPEAT_UNTIL = '2060-12-30T23:05:19+01:00';
export const WEBCAL_FAILED_THRESHOLD = '4 HOURS';

const env = loadEnv();
export const datetimeColumnType = env?.isElectron ? 'datetime' : 'timestamptz';

export const APP_DIR = './.bloben';
export const SQLITE_DB_NAME = 'data.sqlite';
