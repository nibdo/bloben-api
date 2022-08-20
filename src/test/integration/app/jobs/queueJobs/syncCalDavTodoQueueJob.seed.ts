import { DAVCalendarObject } from 'tsdav';
import { DAV_ACCOUNT_TYPE } from '../../../../../bloben-interface/enums';
import { ImportMock } from 'ts-mock-imports';
import { forEach } from 'lodash';
import { formatTodoJsonToCalDavTodo } from '../../../../../utils/davHelperTodo';
import { generateRandomString } from '../../../../../utils/common';
import { io } from '../../../../../app';
import { seedUserWithEntity } from '../../../seeds/1-user-seed';
import CalDavAccountEntity from '../../../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../../../data/repository/CalDavAccountRepository';
import CalDavCalendarEntity from '../../../../../data/entity/CalDavCalendar';
import CalDavCalendarRepository from '../../../../../data/repository/CalDavCalendarRepository';
import CalDavTaskEntity from '../../../../../data/entity/CalDavTaskEntity';
import CalDavTaskRepository from '../../../../../data/repository/CalDavTaskRepository';
import ICalParser, { TodoJSON } from 'ical-js-parser';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsdav = require('tsdav');

const createTestIcalString = (id: string, summary?: string) =>
  `BEGIN:VCALENDAR
VERSION:2.0
PRODID:Bloben
CALSCALE:GREGORIAN
BEGIN:VTODO
DTSTAMP:20220306T220252Z
LAST-MODIFIED:20220306T220252Z
UID:${id}
SEQUENCE:0
SUMMARY:${summary ? summary : 'Old value'}
DESCRIPTION:
STATUS:NEEDS-ACTION
CREATED:20220306T214034Z
END:VTODO
END:VCALENDAR
`;

export const todoToInsertID = 'fd2acf38-40d7-4d33-b708-da1df05d18e1';
export const todoToUpdateID = '1ad2b4f3-f4d3-47ff-93d2-99a8eec4c0b2';
export const todoToKeepID = '3235e210-5678-4975-aa05-56b4747fbd4c';
export const todoToDeleteID = 'bebdce1a-f576-2b38-9ac7-e301ab32d6f9';

const etagToKeep = 'FGHBAFJi123';

const prepareData = async (accountUrl: string, calendarUrl: string) => {
  const { user } = await seedUserWithEntity();

  const newAccount = new CalDavAccountEntity(
    {
      username: 'username1',
      password: 'aaabbbb',
      url: accountUrl,
      accountType: DAV_ACCOUNT_TYPE.CALDAV,
    },
    user
  );
  newAccount.principalUrl = accountUrl;
  newAccount.url = accountUrl;

  const newCalendar = new CalDavCalendarEntity();

  newCalendar.calDavAccount = newAccount;
  newCalendar.displayName = 'default';
  newCalendar.data = JSON.stringify({ displayName: 'default' });
  newCalendar.ctagTasks = 'AB1212341';
  newCalendar.url = `${calendarUrl}`;

  await CalDavAccountRepository.getRepository().save(newAccount);
  await CalDavCalendarRepository.getRepository().save(newCalendar);

  const todos: CalDavTaskEntity[] = [];

  const todoIDS = [todoToUpdateID, todoToKeepID, todoToDeleteID];

  forEach(todoIDS, (id) => {
    const icalJS = ICalParser.toJSON(createTestIcalString(id));
    const todoJSON: TodoJSON = icalJS.todos[0];
    const todoObj = formatTodoJsonToCalDavTodo(
      todoJSON,
      {
        data: '',
        etag: id === todoToKeepID ? etagToKeep : generateRandomString(20),
        url: `${calendarUrl}/${id}`,
      } as DAVCalendarObject,
      newCalendar
    );

    todos.push(new CalDavTaskEntity(todoObj));
  });

  await CalDavTaskRepository.getRepository().save(todos);

  return user;
};

const prepareMock = (accountUrl: string, calendarUrl: string) => {
  ImportMock.restore();

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  io = {
    to: () => {
      return {
        emit: () => {
          return;
        },
      };
    },
  };

  const mockManager = ImportMock.mockClass(tsdav, 'DAVClient');
  // @ts-ignore
  mockManager.set('login', () => {
    return;
  });

  // @ts-ignore
  mockManager.set('fetchCalendars', () => {
    return [
      {
        components: ['VEVENT', 'VTODO'],
        ctag: 'BGTPY123111',
        displayName: 'default',
        url: `${calendarUrl}`,
      },
    ];
  });

  // @ts-ignore
  mockManager.set('calendarQuery', () => {
    const todoIDS = [todoToInsertID, todoToUpdateID, todoToKeepID];

    return todoIDS.map((id) => ({
      raw: '',
      href: `${calendarUrl}/${id}`,
      status: 200,
      statusText: 'Ok',
      ok: true,
      props: {
        getetag: id === todoToKeepID ? etagToKeep : 'xxv1v87sd4v7sd8v1sd7v',
      },
    }));
  });

  // @ts-ignore
  mockManager.set('fetchCalendarObjects', () => {
    const todoIDS = [todoToInsertID, todoToUpdateID, todoToKeepID];

    return todoIDS.map((id) => ({
      data: createTestIcalString(
        id,
        id === todoToKeepID ? undefined : 'New value'
      ),
      etag: id === todoToKeepID ? etagToKeep : 'xxv1v87sd4v7sd8v1sd7v',
      url: `${calendarUrl}/${id}`,
    }));
  });

  return mockManager;
};

/**
 *
 * Test insert new task
 * Test updating existing task
 * Test keeping not changed task
 * Test delete task
 *
 * Test creating new calendar
 * Test updating ctag to new value
 * Test deleting calendar
 */
export const initSyncCalDavTodoQueueJobData = async (accountUrl: string) => {
  const calendarUrl = `${accountUrl}/default`;

  // prepare initial data
  const user = await prepareData(accountUrl, calendarUrl);

  // prepare mock data
  await prepareMock(accountUrl, calendarUrl);

  return user;
};
