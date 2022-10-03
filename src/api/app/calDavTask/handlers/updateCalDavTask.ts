import { Request, Response } from 'express';

import { CommonResponse, UpdateCalDavEventRequest } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import {
  createCalendarObject,
  deleteCalendarObject,
  fetchCalendarObjects,
  updateCalendarObject,
} from 'tsdav';
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
import CalDavTaskRepository from '../../../../data/repository/CalDavTaskRepository';
import logger from '../../../../utils/logger';

export const updateCalDavTask = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  const { userID } = res.locals;

  const body: UpdateCalDavEventRequest = req.body;

  let response: any;
  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const task = await CalDavTaskRepository.getByID(body.id, userID);

  if (!task) {
    throw throwError(404, 'Task not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  if (body.prevEvent) {
    response = await createCalendarObject({
      headers: davHeaders,
      calendar: calDavAccount.calendar,
      filename: `${body.externalID}.ics`,
      iCalString: body.iCalString,
    });
  } else {
    response = await updateCalendarObject({
      headers: davHeaders,
      calendarObject: {
        url: body.url,
        data: body.iCalString,
        etag: body.etag,
      },
    });
  }

  handleDavResponse(response, 'Update task error');

  const fetchedTasks = await fetchCalendarObjects({
    headers: davHeaders,
    calendar: calDavAccount.calendar,
    objectUrls: [response.url],
  });

  const taskTemp = createTaskFromCalendarObject(
    fetchedTasks[0],
    calDavAccount.calendar
  );

  // delete previous task if calendar was changed
  if (body.prevEvent) {
    const responseDelete = await deleteCalendarObject({
      headers: davHeaders,
      calendarObject: {
        url: body.prevEvent.url,
        etag: body.prevEvent.etag,
      },
    });

    handleDavResponse(responseDelete, 'Update task error');
  }

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (body.prevEvent) {
      await queryRunner.manager.delete(CalDavTaskEntity, {
        id: body.id,
      });
    }

    if (taskTemp) {
      const newTask = new CalDavTaskEntity(taskTemp);

      if (!body.prevEvent) {
        await queryRunner.manager.update(
          CalDavTaskEntity,
          {
            id: body.id,
          },
          newTask
        );
      } else {
        await queryRunner.manager.save(newTask);
      }
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASKS })
    );

    return createCommonResponse('Task updated');
  } catch (e) {
    logger.error('Update calDav task error', e, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV_TASK,
    ]);
    if (queryRunner !== null) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    throw throwError(500, 'Unknown error', req);
  }
};
