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
import { UpdateCalDavEventRequest } from '../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../utils/common';
import {
  createEventFromCalendarObject,
  formatInviteData,
} from '../../../utils/davHelper';
import { emailBullQueue } from '../../../service/BullQueue';
import { forEach } from 'lodash';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { parseAlarmDuration } from '../../../utils/caldavAlarmHelper';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventAlarmEntity from '../../../data/entity/CalDavEventAlarmEntity';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import logger from '../../../utils/logger';

export const processCaldavAlarms = async (
  queryRunner: QueryRunner,
  alarms: any,
  event: CalDavEventEntity
) => {
  const promises: any = [];

  forEach(alarms, (alarm) => {
    const isBefore: boolean = alarm?.trigger?.slice(0, 1) === '-';

    const duration = parseAlarmDuration(alarm.trigger);

    if (duration && alarm?.trigger) {
      const entries = Object.entries(duration);
      const newAlarm = new CalDavEventAlarmEntity(event);

      newAlarm.amount = Number(entries[0][1]);
      newAlarm.timeUnit = entries[0][0];
      newAlarm.beforeStart = isBefore;

      if (alarm.xBlobenAlarmType) {
        newAlarm.alarmType = alarm.xBlobenAlarmType;
      }

      promises.push(queryRunner.manager.save(newAlarm));
    }
  });

  await Promise.all(promises);
};

export const updateCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  const { userID } = res.locals;

  const body: UpdateCalDavEventRequest = req.body;

  const event = await CalDavEventRepository.getCalDavEventByID(userID, body.id);

  if (!event) {
    throw throwError('404', 'Event not found');
  }

  let response: any;
  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError('404', 'Account not found');
  }

  const client = await loginToCalDav(calDavAccount);

  if (body.prevEvent) {
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

  if (response.status >= 300) {
    logger.error('Update calDav event error', response.statusText, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);

    throw throwError(409, `Cannot update event: ${response.statusText}`);
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
    if (eventTemp) {
      await queryRunner.manager.delete(CalDavEventAlarmEntity, {
        event,
      });

      const newEvent = new CalDavEventEntity(eventTemp);
      newEvent.id = event.id;

      await queryRunner.manager.update(
        CalDavEventEntity,
        {
          id: event.id,
        },
        newEvent
      );

      if (eventTemp.alarms) {
        await processCaldavAlarms(queryRunner, eventTemp.alarms, newEvent);
      }
    }

    if (eventTemp.props?.attendee) {
      await emailBullQueue.add(
        BULL_QUEUE.EMAIL,
        formatInviteData(
          userID,
          eventTemp,
          body.iCalString,
          eventTemp.props.attendee,
          CALENDAR_METHOD.REQUEST
        )
      );
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

    await queryRunner.commitTransaction();
    await queryRunner.release();

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
    );

    return createCommonResponse('Event updated');
  } catch (e) {
    logger.error('Update calDav event error', e, [
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
