import { Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
  TIMEZONE,
} from '../../../../utils/enums';
import { CommonResponse, UpdateCalDavEventRequest } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { DateTime } from 'luxon';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import { RRule } from 'rrule';
import { cardDavBullQueue } from '../../../../service/BullQueue';
import { createCommonResponse, formatToRRule } from '../../../../utils/common';
import { deleteCalendarObject } from 'tsdav';
import { forEach } from 'lodash';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import {
  handleCreateContact,
  removeOrganizerFromAttendeesOriginalData,
} from './createCalDavEvent';
import { io } from '../../../../app';
import { parseAlarmDuration } from '../../../../utils/caldavAlarmHelper';
import { throwError } from '../../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventAlarmEntity from '../../../../data/entity/CalDavEventAlarmEntity';
import CalDavEventEntity from '../../../../data/entity/CalDavEventEntity';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import CalendarSettingsRepository from '../../../../data/repository/CalendarSettingsRepository';
import LuxonHelper from '../../../../utils/luxonHelper';
import ReminderEntity from '../../../../data/entity/ReminderEntity';
import logger from '../../../../utils/logger';

export const processCaldavAlarms = async (
  queryRunner: QueryRunner,
  alarms: any,
  event: CalDavEventEntity,
  userID: string
) => {
  const promises: any = [];

  forEach(alarms, (alarm) => {
    if (alarm?.trigger) {
      const isBefore: boolean = alarm?.trigger?.slice(0, 1) === '-';

      const duration = parseAlarmDuration(alarm.trigger);

      if (duration && alarm?.trigger) {
        const entries = Object.entries(duration);
        const newAlarm = new CalDavEventAlarmEntity(event);

        newAlarm.amount = Number(entries[0][1]);
        newAlarm.timeUnit = entries[0][0];
        newAlarm.beforeStart = isBefore;

        promises.push(queryRunner.manager.save(newAlarm));
      }
    }
  });

  const eventAlarms = await Promise.all(promises);

  const calendarSettings = await CalendarSettingsRepository.findByUserID(
    userID
  );

  const remindersPromises: any = [];
  forEach(eventAlarms, (eventAlarm) => {
    const sendAt = LuxonHelper.subtractFromDate(
      event.startAt,
      event.timezoneStartAt || calendarSettings.timezone,
      eventAlarm.amount,
      eventAlarm.timeUnit,
      event.timezoneStartAt === TIMEZONE.FLOATING
    );

    if (event.isRepeated) {
      // calculate reminders in week advance
      const dateNow = DateTime.now();
      const dateTo = dateNow.plus({ weeks: 1 });

      const rRuleString: string = formatToRRule(
        event.rRule,
        sendAt.toISOString()
      );

      const rRule = RRule.fromString(rRuleString);

      const rRuleResults: Date[] = rRule.between(
        new Date(Date.UTC(dateNow.year, dateNow.month - 1, dateNow.day, 0, 0)),
        new Date(
          Date.UTC(
            dateTo.year,
            dateTo.month - 1,
            dateTo.day,
            dateTo.hour,
            dateTo.minute
          )
        )
      );

      forEach(rRuleResults, (rRuleResult) => {
        const newReminder = new ReminderEntity(
          eventAlarm,
          rRuleResult.toISOString(),
          userID
        );
        remindersPromises.push(queryRunner.manager.save(newReminder));
      });
    } else {
      const newReminder = new ReminderEntity(
        eventAlarm,
        sendAt.toISOString(),
        userID
      );
      remindersPromises.push(queryRunner.manager.save(newReminder));
    }
  });

  await Promise.all(remindersPromises);
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
    throw throwError(404, 'Event not found');
  }

  const prevEvent = { ...event };

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    body.calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  let response;

  if (body.prevEvent) {
    const { response: responseData } = await DavService.createEvent(
      userID,
      body.calendarID,
      body.externalID,
      body.iCalString,
      calDavAccount,
      davRequestData
    );
    response = responseData;
  } else {
    const { response: responseData } = await DavService.updateEvent(
      userID,
      body.calendarID,
      event,
      body.iCalString,
      calDavAccount,
      davRequestData
    );
    response = responseData;
  }

  const eventTemp = (
    await DavService.getAndFormatServerEvents(
      davHeaders,
      response.url,
      calDavAccount.calendar
    )
  )?.[0];

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
        await processCaldavAlarms(
          queryRunner,
          eventTemp.alarms,
          newEvent,
          userID
        );
      }
    }

    if (body.sendInvite) {
      await InviteService.updateNormalEvent(
        prevEvent,
        eventTemp,
        userID,
        body.iCalString,
        body.inviteMessage
      );
    }

    if (event.attendees?.length) {
      const settings = await CalendarSettingsRepository.findByUserID(userID);

      if (settings?.saveContactsAuto && settings?.defaultAddressBookID) {
        const carddavPromises: any = [];
        forEach(
          removeOrganizerFromAttendeesOriginalData(
            eventTemp.organizer,
            eventTemp.attendees
          ),
          (attendee) => {
            carddavPromises.push(
              handleCreateContact(
                userID,
                settings.defaultAddressBookID,
                v4(),
                attendee.mailto,
                attendee.CN
              )
            );
          }
        );

        await Promise.all(carddavPromises);

        await cardDavBullQueue.add(BULL_QUEUE.CARDDAV_SYNC, { userID });
      }
    }

    // delete previous event if calendar was changed
    if (body.prevEvent) {
      await deleteCalendarObject({
        headers: davHeaders,
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
