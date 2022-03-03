export enum API_VERSIONS {
  V1 = 'v1',
  V2 = 'v2',
}

export enum REQ_HEADER {
  API_KEY = 'api-key',
}

export enum IP_ADDRESS_GROUP {
  MONITORING = 'MONITORING',
}

export enum APP_ROUTE {
  CALENDAR_APP = 'calendar-app',
  NOTES_APP = 'notes-app',
}

export enum SESSION {
  USERNAME_KEY = 'username',
  SRP_SESSION_KEY = 'srpSession',
  USER_ID = 'userID',
  ROLE = 'role',
  APP_TYPE = 'appType',
  ADMIN_USER_ID = '',
}

export enum REDIS_PREFIX {
  SOCKET = 'socketuserID',
  USER_ID_KEY_2FA = 'userID2FA',
  CHANGE_PASSWORD = 'changePassword',
}

export enum WEBSOCKET_PREFIX {
  CLIENT_SESSION_ID = 'clientSessionId',
}

export enum SOCKET_CHANNEL {
  CALENDAR = 'calendar',
  NOTES = 'notes',
  SYNC = 'sync',
}

export enum SOCKET_MSG_TYPE {
  CALDAV_EVENTS = 'CALDAV_EVENTS',
  CALDAV_CALENDARS = 'CALDAV_CALENDARS',
}

export enum TIMEZONE {
  FLOATING = 'floating',
}

export enum MSG_STATUS {
  SUCCESS = 'success',
  FAIL = 'fail',
}

export enum RATE_LIMIT {
  GET_SESSION = 500,
  LOGIN = 5 * 1000, // 5 seconds
  REGISTER = 120 * 1000, // 2 minutes
  REGISTER_DEMO = 15 * 1000, // 15 seconds
  ADMIN_LOGIN = 20 * 1000, // 20 seconds
  CHALLENGE = 10 * 1000, // 10 seconds
  DEFAULT = 500,
  GET_EVENTS = 50,
  SYNC = 60 * 1000,
  TIMEZONE = 20 * 1000,
}

export enum BODY_SIZE {
  DEFAULT = 1024 * 5,
  IMPORT_DEVICE = 1024 * 10,
}

export enum NODE_ENV {
  TEST = 'test',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum LOG_LEVEL {
  ALERT = 'alert',
  CRIT = 'crit',
  ERROR = 'error',
  WARN = 'warn',
  NOTICE = 'notive',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum CONNECTION_NAME {
  DEFAULT = 'default',
}

export enum APP_TYPE {
  WEB = 'web',
  MOBILE = 'mobile',
}

export enum FE_APP_TYPE {
  WEB = 'web',
  ANDROID = 'android',
}

export enum EVENT_INVITE_STATE {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export enum EVENT_INVITE_METHOD {
  REQUEST = 'REQUEST',
}

export enum CALDAV_OBJ_TYPE {
  EVENT = 'EVENT',
  TODO = 'TODO',
}

export enum BULL_QUEUE {
  CALDAV_SYNC = 'CALDAV_SYNC',
  WEBCAL_SYNC = 'WEBCAL_SYNC',
}

export enum SOCKET_ROOM_NAMESPACE {
  USER_ID = 'user_id_',
}