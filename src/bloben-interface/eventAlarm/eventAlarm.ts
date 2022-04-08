import { ALARM_TYPE, ALARM_UNIT } from '../enums';

export interface Alarm {
  alarmType: ALARM_TYPE;
  amount: number;
  id: string;
  timeUnit: ALARM_UNIT;
}
