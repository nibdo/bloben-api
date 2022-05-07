import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { CALENDAR_METHOD } from '../../../utils/ICalHelper';
import { CommonResponse } from '../../../bloben-interface/interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { CreateCalDavEventRequest } from '../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../utils/common';
import {
  createEventFromCalendarObject,
  formatInviteData,
} from '../../../utils/davHelper';
import { emailBullQueue } from '../../../service/BullQueue';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { processCaldavAlarms } from './updateCalDavEvent';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import logger from '../../../utils/logger';

export const createCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  const { userID } = res.locals;
  const body: CreateCalDavEventRequest = req.body;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount || (calDavAccount && !calDavAccount.calendar?.id)) {
    throw throwError(404, 'Account with calendar not found');
  }

  const client = await loginToCalDav(calDavAccount);

  const response: any = await client.createCalendarObject({
    calendar: calDavAccount.calendar,
    filename: `${body.externalID}.ics`,
    iCalString: body.iCalString,
  });

  if (response.status >= 300) {
    logger.error(
      `Status: ${response.status} Message: ${response.statusText}`,
      null,
      [LOG_TAG.CALDAV, LOG_TAG.REST]
    );
    throw throwError(409, `Cannot create event: ${response.statusText}`);
  }

  const fetchedEvents = await client.fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [response.url],
  });

  const eventTemp = createEventFromCalendarObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let newEvent;
    if (eventTemp) {
      newEvent = new CalDavEventEntity(eventTemp);

      await CalDavEventRepository.getRepository().save(newEvent);

      if (eventTemp.alarms) {
        await processCaldavAlarms(
          queryRunner,
          eventTemp.alarms,
          newEvent,
          userID
        );
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // @ts-ignore
      if (newEvent.props?.attendee) {
        await emailBullQueue.add(
          BULL_QUEUE.EMAIL,
          formatInviteData(
            userID,
            eventTemp,
            body.iCalString,
            // @ts-ignore
            newEvent.props.attendee,
            CALENDAR_METHOD.REQUEST
          )
        );
      }
    }

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
    );

    return createCommonResponse('Event created');
  } catch (e) {
    logger.error('Create calDav event error', e, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);
    if (queryRunner !== null) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw throwError(500, 'Unknown error', req);
    }
  }
};
