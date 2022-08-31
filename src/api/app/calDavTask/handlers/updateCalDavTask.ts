import { Request, Response } from 'express';

import { CommonResponse } from '../../../../bloben-interface/interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { UpdateCalDavEventRequest } from '../../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../../utils/common';
import { createTaskFromCalendarObject } from '../../../../utils/davHelperTodo';
import { io } from '../../../../app';
import { loginToCalDav } from '../../../../service/davService';
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

  const client = await loginToCalDav(calDavAccount);

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (body.prevEvent) {
      await queryRunner.manager.delete(CalDavTaskEntity, {
        id: body.id,
      });

      response = await client.createCalendarObject({
        calendar: calDavAccount.calendar,
        filename: `${body.externalID}.ics`,
        iCalString: body.iCalString,
      });
    } else {
      response = await client.updateCalendarObject({
        calendarObject: {
          url: body.url,
          data: body.iCalString,
          etag: body.etag,
        },
      });
    }

    const fetchedTasks = await client.fetchCalendarObjects({
      calendar: calDavAccount.calendar,
      objectUrls: [response.url],
    });

    const taskTemp = createTaskFromCalendarObject(
      fetchedTasks[0],
      calDavAccount.calendar
    );

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

    // delete previous task if calendar was changed
    if (body.prevEvent) {
      await client.deleteCalendarObject({
        calendarObject: {
          url: body.prevEvent.url,
          etag: body.prevEvent.etag,
        },
      });
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
