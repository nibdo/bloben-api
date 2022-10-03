import { Request, Response } from 'express';

import { CommonResponse, CreateCalDavEventRequest } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCalendarObject, fetchCalendarObjects } from 'tsdav';
import {
  createCommonResponse,
  handleDavResponse,
} from '../../../../utils/common';
import { createTaskFromCalendarObject } from '../../../../utils/davHelperTodo';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { io } from '../../../../app';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavTaskEntity from '../../../../data/entity/CalDavTaskEntity';
import CalDavTaskSettingsEntity from '../../../../data/entity/CalDavTaskSettings';
import CalDavTaskSettingsRepository from '../../../../data/repository/CalDavTaskSettingsRepository';
import logger from '../../../../utils/logger';

export const createCalDavTask = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const body: CreateCalDavEventRequest = req.body;

  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount || (calDavAccount && !calDavAccount.calendar?.id)) {
    throw throwError(404, 'Account with calendar not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  const response: any = await createCalendarObject({
    headers: davHeaders,
    calendar: calDavAccount.calendar,
    filename: `${body.externalID}.ics`,
    iCalString: body.iCalString,
  });

  handleDavResponse(response, 'Create task error');

  const fetchedTodos = await fetchCalendarObjects({
    headers: davHeaders,
    calendar: calDavAccount.calendar,
    objectUrls: [response.url],
  });

  const taskTemp = createTaskFromCalendarObject(
    fetchedTodos[0],
    calDavAccount.calendar
  );

  try {
    if (taskTemp) {
      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const newTask = new CalDavTaskEntity(taskTemp);

      await queryRunner.manager.save(newTask);

      const taskSettings = await CalDavTaskSettingsRepository.getByCalendarID(
        calDavAccount.calendar.id,
        userID
      );

      const newOrder = [newTask.id, ...taskSettings.order];
      await queryRunner.manager.update(
        CalDavTaskSettingsEntity,
        {
          id: taskSettings.id,
        },
        {
          order: newOrder,
        }
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASK_SETTINGS })
      );

      io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
        SOCKET_CHANNEL.SYNC,
        JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASKS })
      );

      return createCommonResponse('Task created', {
        id: newTask.id,
      });
    }
  } catch (e) {
    logger.error('Create calDav task error', e, [LOG_TAG.REST, LOG_TAG.CALDAV]);
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
    throw throwError(500, 'Unknown error', req);
  }
};
