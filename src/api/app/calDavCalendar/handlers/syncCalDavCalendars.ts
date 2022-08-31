import { Connection, QueryRunner, getConnection } from 'typeorm';
import { GetCalDavCalendar } from '../../../../bloben-interface/calDavCalendar/calDavCalendar';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { Request, Response } from 'express';
import {
  SOCKET_APP_TYPE,
  SOCKET_CRUD_ACTION,
} from '../../../../bloben-interface/enums';
import {
  createCalDavCalendar,
  updateCalDavCalendar,
} from '../../caldavAccount/helpers/createCalDavCalendar';
import { createDavClient } from '../../../../service/davService';
import { createSocketCrudMsg } from '../../../../utils/common';
import { find, forEach } from 'lodash';
import { formatCalendarResponse } from './getCalDavCalendars';
import { io } from '../../../../app';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavCalendarEntity from '../../../../data/entity/CalDavCalendar';
import logger from '../../../../utils/logger';

const checkCalendarChange = (localCalendar: any, serverCalendar: any) => {
  if (
    localCalendar.description !== serverCalendar.description ||
    localCalendar.timezone !== serverCalendar.timezone ||
    localCalendar.ctag !== serverCalendar.ctag ||
    localCalendar.calendarColor !== serverCalendar.calendarColor ||
    localCalendar.displayName !== serverCalendar.displayName
  ) {
    return true;
  }

  return false;
};

export const getRemoteCalDavCalendars = async (userID: string) => {
  const calDavAccounts = await CalDavAccountRepository.getCalDavAccountsForSync(
    userID
  );

  for (const calDavAccount of calDavAccounts) {
    let connection: Connection | null;
    let queryRunner: QueryRunner | null;

    try {
      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.startTransaction();

      const client = createDavClient(calDavAccount.url, {
        username: calDavAccount.username,
        password: calDavAccount.password,
      });
      await client.login();

      const serverCalendars = await client.fetchCalendars({});

      const newCalendarsPromises: any = [];
      const updateCalendarsPromises: Promise<GetCalDavCalendar>[] = [];

      forEach(serverCalendars, (serverCalendar: any) => {
        const localCalendar = find(
          calDavAccount.calendars,
          (item: any) => item.url === serverCalendar.url
        );

        if (localCalendar) {
          // update
          if (checkCalendarChange(localCalendar, serverCalendar)) {
            updateCalendarsPromises.push(
              updateCalDavCalendar(
                localCalendar.id,
                serverCalendar,
                calDavAccount,
                queryRunner
              )
            );
          }
        } else {
          // insert
          newCalendarsPromises.push(
            createCalDavCalendar(serverCalendar, calDavAccount, queryRunner)
          );
        }
      });

      const newCalendars: any = await Promise.all(newCalendarsPromises);
      forEach(newCalendars, (newCalendar: any) => {
        io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
          SOCKET_CHANNEL.SYNC,
          createSocketCrudMsg(
            newCalendar.id,
            new Date().toISOString(),
            SOCKET_CRUD_ACTION.CREATE,
            SOCKET_APP_TYPE.CALENDAR,
            formatCalendarResponse(newCalendar, calDavAccount)
          )
        );
      });
      const updateCalendars: GetCalDavCalendar[] = await Promise.all(
        updateCalendarsPromises
      );
      forEach(updateCalendars, (updateCalendar: any) => {
        io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
          SOCKET_CHANNEL.CALENDAR,
          createSocketCrudMsg(
            updateCalendar.id,
            new Date().toISOString(),
            SOCKET_CRUD_ACTION.UPDATE,
            SOCKET_APP_TYPE.CALENDAR,
            updateCalendar
          )
        );
      });

      // check deleted calendars
      const promisesToDelete: any = [];
      const idsToDelete: any = [];
      forEach(calDavAccount.calendars, (localCalendar: any) => {
        let wasFound = false;

        forEach(serverCalendars, (serverCalendar: any) => {
          if (serverCalendar.url === localCalendar.url) {
            wasFound = true;
          }
        });

        if (!wasFound) {
          idsToDelete.push(localCalendar.id);
          promisesToDelete.push(
            queryRunner.manager.delete(CalDavCalendarEntity, {
              id: localCalendar.id,
            })
          );
        }
      });

      await Promise.all(promisesToDelete);
      forEach(idsToDelete, (id: string) => {
        io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
          SOCKET_CHANNEL.CALENDAR,
          createSocketCrudMsg(
            id,
            new Date().toISOString(),
            SOCKET_CRUD_ACTION.DELETE,
            SOCKET_APP_TYPE.CALENDAR
          )
        );
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (e) {
      logger.error('Sync calDav calendars error', e, [
        LOG_TAG.REST,
        LOG_TAG.CALDAV,
      ]);
      if (queryRunner !== null) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        throw throwError(500, 'Unknown error');
      }
    }
  }
};

export const syncCalDavCalendars = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userID } = res.locals;

  await getRemoteCalDavCalendars(userID);
};
