import { AccountWithCalendars } from '../../../data/repository/CalDavAccountRepository';
import { DAVCalendar } from 'tsdav';
import { GetCalDavCalendar } from '../../../bloben-interface/calDavCalendar/calDavCalendar';
import { QueryRunner } from 'typeorm';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CalDavCalendarEntity from '../../../data/entity/CalDavCalendar';

/**
 * Internal function
 * @param data
 * @param calDavAccount
 * @param queryRunner
 */
export const createCalDavCalendar = async (
  data: DAVCalendar,
  calDavAccount: CalDavAccountEntity | AccountWithCalendars,
  queryRunner: QueryRunner
): Promise<CalDavCalendarEntity> => {
  const calDavCalendar: CalDavCalendarEntity = new CalDavCalendarEntity();

  const calDavAccountEnt = new CalDavAccountEntity();
  calDavAccountEnt.id = calDavAccount.id;

  // calDavCalendar.principalUrl = data.principalUrl;
  calDavCalendar.displayName = data.displayName;
  calDavCalendar.timezone = data.timezone;
  calDavCalendar.ctag = data.ctag;
  calDavCalendar.data = JSON.stringify(data);
  calDavCalendar.calDavAccount = calDavAccountEnt;
  calDavCalendar.components = data.components;
  calDavCalendar.color =
    // @ts-ignore
    typeof data.calendarColor === 'string' ? data.calendarColor : 'indigo';
  calDavCalendar.url = data.url;

  await queryRunner.manager.save(calDavCalendar);

  return calDavCalendar;
};

export const updateCalDavCalendar = async (
  localCalendarID: string,
  data: DAVCalendar,
  calDavAccount: CalDavAccountEntity | AccountWithCalendars,
  queryRunner: QueryRunner
): Promise<GetCalDavCalendar> => {
  const calDavAccountEnt = new CalDavAccountEntity();
  calDavAccountEnt.id = calDavAccount.id;

  const dataToUpdate: any = {
    displayName: data.displayName,
    timezone: data.timezone,
    ctag: data.ctag,
    data: JSON.stringify(data),
    calDavAccount: calDavAccountEnt,
    color:
      // @ts-ignore
      typeof data.calendarColor === 'string' ? data.calendarColor : 'indigo',
    url: data.url,
  };

  await queryRunner.manager.update(
    CalDavCalendarEntity,
    { id: localCalendarID },
    dataToUpdate
  );

  return {
    id: localCalendarID,
    displayName: data.displayName,
    url: data.url,
    color: dataToUpdate.color,
    components: data.components,
    timezone: data.timezone,
    calDavAccountID: calDavAccount.id,
  };
};
