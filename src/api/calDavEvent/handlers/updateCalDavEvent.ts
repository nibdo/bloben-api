import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { UpdateCalDavEventRequest } from '../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../utils/common';
import { createEventFromCalendarObject } from '../../../utils/davHelper';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import logger from '../../../utils/logger';

export const updateCalDavEvent = async (
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
    throw throwError('404', 'Not found');
  }

  const client = await loginToCalDav(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await queryRunner.manager.delete(CalDavEventEntity, {
      id: body.internalID,
    });

    if (body.prevEvent) {
      response = await client.createCalendarObject({
        calendar: calDavAccount.calendar,
        filename: `${body.id}.ics`,
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

    const fetchedEvents = await client.fetchCalendarObjects({
      calendar: calDavAccount.calendar,
      objectUrls: [response.url],
    });

    const eventTemp = createEventFromCalendarObject(
      fetchedEvents[0],
      calDavAccount.calendar
    );

    if (eventTemp) {
      const newEvent = new CalDavEventEntity(eventTemp);

      await queryRunner.manager.save(newEvent);
    }

    // delete previous event if calendar was changed
    if (body.prevEvent) {
      await client.deleteCalendarObject({
        calendarObject: {
          url: body.prevEvent.url,
          etag: body.prevEvent.etag,
        },
      });
    }

    // delete cache
    // await CalDavCacheService.deleteByUserID(userID);

    // trigger resync for cached events
    // await CalDavCacheService.syncEventsForAccount(calDavAccount);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
    );

    return createCommonResponse('Event updated');
  } catch (e) {
    logger.error('Update calDav event error', e);
    if (queryRunner !== null) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw throwError(500, 'Unknown error', req);
    }
  }
};