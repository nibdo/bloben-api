import {
  AccountWithCalendars,
  CalendarFromAccount,
} from '../data/repository/CalDavAccountRepository';
import { DAVCalendarObject, DAVClient } from 'tsdav';

import { createDavClient } from '../service/davService';
import { find, forEach } from 'lodash';
import { getCalendarObjectsByUrl } from './davHelper';

import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from './enums';
import { io } from '../app';
import CalDavCalendarEntity from '../data/entity/CalDavCalendar';
import CalDavTaskEntity from '../data/entity/CalDavTaskEntity';
import CalDavTaskRepository from '../data/repository/CalDavTaskRepository';
import ICalParser, { TodoJSON } from 'ical-js-parser';
import logger from './logger';

export interface CalDavEventObj {
  externalID: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezone: string | null;
  isRepeated: boolean;
  summary: string;
  location: string | null;
  description: string | null;
  etag: string;
  color: string;
  alarms: any;
  rRule: string | null;
  href: string;
  [key: string]: any;
}

export const formatTodoJsonToCalDavTodo = (
  item: TodoJSON,
  calendarObject: DAVCalendarObject,
  calendar: CalDavCalendarEntity
): CalDavEventObj => {
  return {
    ...{ ...calendarObject, data: null }, // clear ical data prop
    calendarID: calendar.id,
    externalID: item.uid || '',
    startAt: item.dtstart?.value,
    endAt: item.dtend?.value,
    timezone: item.dtstart?.timezone || null,
    isRepeated: item.rrule !== undefined || false,
    rRule: item.rrule || null,
    summary: item.summary || '',
    location: item.location || null,
    description: item.description || null,
    etag: calendarObject.etag,
    color: calendar.color || 'indigo',
    alarms: item.alarms,
    href: calendarObject.url,
    status: item.status,
  };
};

// Note id and url are not linked
export const createTaskFromCalendarObject = (
  calendarObject: DAVCalendarObject,
  calendar: any
) => {
  const icalJS = ICalParser.toJSON(calendarObject.data);
  const todo: TodoJSON = icalJS.todos[0];

  if (todo) {
    return formatTodoJsonToCalDavTodo(todo, calendarObject, calendar);
  }
};

export const queryClientForTasks = async (
  client: DAVClient,
  serverCalendar: any
) =>
  client.calendarQuery({
    url: serverCalendar.url,
    // @ts-ignore
    _attributes: {
      'xmlns:D': 'DAV:',
      'xmlns:C': 'urn:ietf:params:xml:ns:caldav',
    },
    prop: {
      getetag: {},
    },
    filters: {
      'comp-filter': {
        _attributes: {
          name: 'VCALENDAR',
        },
        'comp-filter': {
          _attributes: {
            name: 'VTODO',
          },
        },
      },
    },
    depth: '1',
  });

const syncTasksForAccount = async (calDavAccount: AccountWithCalendars) => {
  let wasChanged = false;

  const calDavCalendars: CalendarFromAccount[] = calDavAccount.calendars
    ? calDavAccount.calendars
    : [calDavAccount.calendar];

  const client = createDavClient(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });
  await client.login();

  // fetch calendars
  const serverCalendars = await client.fetchCalendars();

  const calendarsToCheck: any = [];
  const calendarsToUpdateCtag: { [id: string]: { newCtag: string } } = {};

  for (const serverCalendar of serverCalendars) {
    const localCalendar = find(
      calDavCalendars,
      (calDavCalendar: CalendarFromAccount) =>
        calDavCalendar.url.includes(serverCalendar.url)
    );

    if (localCalendar) {
      if (serverCalendar.ctag !== localCalendar.ctagTasks) {
        calendarsToCheck.push(localCalendar);

        wasChanged = true;
        calendarsToUpdateCtag[localCalendar.id] = {
          newCtag: serverCalendar.ctag,
        };
      }
    }
  }

  for (const calendarToCheck of calendarsToCheck) {
    let connection: Connection | null;
    let queryRunner: QueryRunner | null;

    try {
      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // update ctag
      await queryRunner.manager.update(
        CalDavCalendarEntity,
        { id: calendarsToCheck.id },
        {
          ctagTasks: calendarsToUpdateCtag[calendarToCheck.id].newCtag,
        }
      );

      // get existing tasks
      const existingTasks: {
        id: string;
        etag: string;
        externalID: string;
      }[] = await CalDavTaskRepository.getRepository().query(
        `
        SELECT
            t.id as id,
            t.etag as etag,
            t.href as href,
            t.external_id as "externalID"
        FROM 
            caldav_tasks t
        WHERE
            t.caldav_calendar_id = $1
            AND t.deleted_at IS NULL
      `,
        [calendarToCheck.id]
      );

      const toInsert: string[] = [];
      const toDelete: string[] = [];
      const toSoftDelete: string[] = [];
      const softDeleteExternalID: string[] = [];

      const calDavServerResult: any = await queryClientForTasks(
        client,
        calendarToCheck
      );

      // filter todos to insert, update or delete
      forEach(calDavServerResult, (calDavServerItem: any) => {
        let foundLocalItem: any = null;

        forEach(existingTasks, (existingTask: any) => {
          if (existingTask.href.includes(calDavServerItem.href)) {
            foundLocalItem = existingTask;

            if (calDavServerItem.props.getetag !== existingTask.etag) {
              wasChanged = true;

              toInsert.push(calDavServerItem.href);
              toDelete.push(existingTask.id);
            }
          }
        });

        if (!foundLocalItem) {
          wasChanged = true;

          // handle inserts
          if (calDavServerItem.href) {
            toInsert.push(calDavServerItem.href);
          }
        }
      });

      // Clean local items
      forEach(existingTasks, (existingTask: any) => {
        let foundItem: any;
        forEach(calDavServerResult, (calDavServerItem: any) => {
          if (existingTask.href.includes(calDavServerItem.href)) {
            foundItem = calDavServerItem;
          }
        });
        if (!foundItem) {
          toSoftDelete.push(existingTask.id);
          softDeleteExternalID.push(existingTask.externalID);
        }
      });

      // delete tasks
      if (toSoftDelete.length > 0) {
        await queryRunner.manager.query(
          `
      UPDATE
        caldav_tasks
      SET
         deleted_at = now()
      WHERE
          id = ANY($1)
  `,
          [toSoftDelete]
        );
      }

      if (toDelete.length > 0) {
        await queryRunner.manager.query(
          `
      DELETE FROM
        caldav_tasks
      WHERE
          id = ANY($1)
  `,
          [toDelete]
        );
      }

      if (toInsert.length > 0) {
        const toInsertResponse: any = await getCalendarObjectsByUrl(
          client,
          calendarToCheck,
          toInsert
        );

        const promises: any = [];

        forEach(toInsertResponse, (item: any) => {
          if (item.data) {
            const taskTemp = createTaskFromCalendarObject(
              item,
              calendarToCheck
            );

            if (taskTemp) {
              const newTask = new CalDavTaskEntity(taskTemp);
              promises.push(queryRunner.manager.save(newTask));
            }
          }
        });

        await Promise.all(promises);
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return wasChanged;
    } catch (e) {
      if (queryRunner !== null) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        connection = null;
        queryRunner = null;
      }
      logger.error('Sync caldav tasks error', e, [
        LOG_TAG.QUEUE,
        LOG_TAG.CALDAV_TASK,
      ]);
    }
  }
};

export const syncCalDavTasks = async (userID: string, calDavAccounts: any) => {
  for (const calDavAccount of calDavAccounts) {
    const wasChanged = await syncTasksForAccount(calDavAccount);

    if (wasChanged) {
      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASKS })
      );
    }
  }
};
