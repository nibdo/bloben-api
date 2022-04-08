export enum ROLE {
  ADMIN = 'ADMIN',
  DEMO = 'DEMO',
  USER = 'USER',
}

export enum ALARM_TYPE {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
}

export enum ALARM_UNIT {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
}

export enum SOCKET_APP_TYPE {
  CALENDAR = 'CALENDAR',
  WEBCAL_CALENDAR = 'WEBCAL_CALENDAR',
  EVENT = 'EVENT',
  CALENDAR_SETTINGS = 'CALENDAR_SETTINGS',
  CONTACT = 'CONTACT',
  USER_PROFILE = 'USER_PROFILE',
  GENERAL = 'GENERAL',
  CALENDAR_AND_EVENTS = 'calendarAndEvents',
}

export enum SOCKET_CRUD_ACTION {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  BULK = 'BULK',
  FULL = 'FULL',
}

export enum EVENT_TYPE {
  CALDAV = 'CALDAV',
  WEBCAL = 'WEBCAL',
}

export enum LOG_FILE_TYPE {
  COMBINED = 'combined',
  ERROR = 'error',
}

export enum CALDAV_COMPONENTS {
  VEVENT = 'VEVENT',
  VTODO = 'VTODO',
  VJOURNAL = 'VJOURNAL',
}
