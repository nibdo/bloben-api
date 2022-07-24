import { NextFunction, Request, Response } from 'express';

import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { DuplicateMultipleCalDavEventsBody } from '../../../bloben-interface/event/event';
import { createCommonResponse } from '../../../utils/common';

import { CALENDAR_METHOD } from '../../../utils/ICalHelper';
import { CalDavEventObj, formatInviteData } from '../../../utils/davHelper';
import { DateTime } from 'luxon';
import { Job } from 'bullmq';
import { emailBullQueue } from '../../../service/BullQueue';
import { eventResultToCalDavEventObj } from './updateRepeatedCalDavEvent';
import { find, forEach } from 'lodash';
import { formatEventRawToResult } from '../../../utils/format';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { removeOrganizerFromAttendees } from './createCalDavEvent';
import { syncCalDavQueueJob } from '../../../jobs/queueJobs/syncCalDavQueueJob';
import { throwError } from '../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../utils/ICalHelperV2';
import LuxonHelper from '../../../utils/luxonHelper';
import logger from '../../../utils/logger';

interface DuplicateMultipleCalDavEventsRequest extends Request {
  body: DuplicateMultipleCalDavEventsBody;
  params: {
    eventID: string;
  };
}

export const duplicateMultipleCalDavEvents = async (
  req: DuplicateMultipleCalDavEventsRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { params, body } = req;

    const event = await CalDavEventRepository.getEventByID(
      userID,
      params.eventID
    );

    if (!event) {
      throw throwError(404, 'Event not found');
    }

    // get account with calendar
    const calDavAccount =
      await CalDavAccountRepository.getByUserIDAndCalendarID(
        userID,
        event.calendarID
      );

    if (!calDavAccount || (calDavAccount && !calDavAccount.calendar?.id)) {
      throw throwError(404, 'Account with calendar not found');
    }

    // prepare events
    const iCalStrings: { id: string; data: string }[] = [];
    const calDavObjs: CalDavEventObj[] = [];

    const originalStartAt = DateTime.fromJSDate(
      event.startAt as unknown as Date
    );
    const originalEndAt = DateTime.fromJSDate(event.endAt as unknown as Date);
    const diffInHours = LuxonHelper.getDiffInHours(
      event.startAt as unknown as Date,
      event.endAt as unknown as Date
    );

    forEach(body.dates, (date) => {
      let startAtNew = DateTime.fromISO(date);

      startAtNew = startAtNew.set({
        hour: originalStartAt.hour,
        minute: originalStartAt.minute,
      });

      let endAtNew = startAtNew.plus({ hours: diffInHours });

      endAtNew = endAtNew.set({
        hour: originalEndAt.hour,
        minute: originalEndAt.minute,
      });

      const eventResult = formatEventRawToResult(
        {
          ...event,
          externalID: v4(),
          startAt: startAtNew.toUTC().toString(),
          endAt: endAtNew.toUTC().toString(),
        },
        false
      );

      const calDavObj = eventResultToCalDavEventObj(eventResult);
      calDavObjs.push(calDavObj);

      const iCalString: string = new ICalHelperV2([calDavObj]).parseTo();
      iCalStrings.push({ id: calDavObj.externalID, data: iCalString });
    });

    const client = await loginToCalDav(calDavAccount);

    const promises: any = [];

    forEach(iCalStrings, (item) => {
      promises.push(
        client.createCalendarObject({
          calendar: calDavAccount.calendar,
          filename: `${item.id}.ics`,
          iCalString: item.data,
        })
      );
    });

    const davResponses = await Promise.all(promises);

    let successes = 0;
    let failed = 0;

    forEach(davResponses, (davResponse) => {
      if (davResponse.status >= 300) {
        failed += 1;
        logger.error(
          `Status: ${davResponse.status} Message: ${davResponse.statusText}`,
          null,
          [LOG_TAG.CALDAV, LOG_TAG.REST]
        );
      } else {
        successes += 1;
      }
    });

    // force sync
    await syncCalDavQueueJob({
      data: { userID, calendarID: event.calendarID },
    } as Job);

    const response = createCommonResponse(
      `${successes} events created${failed > 0 ? `, ${failed} failed` : ''}`
    );

    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS })
    );

    const emailPromises: any = [];

    forEach(calDavObjs, (item) => {
      if (item.attendees?.length && body.sendInvite) {
        const icalString = find(
          iCalStrings,
          (itemIcal) => item.id === itemIcal.id
        );

        if (icalString) {
          emailPromises.push(
            emailBullQueue.add(
              BULL_QUEUE.EMAIL,
              formatInviteData(
                userID,
                item,
                icalString.data,
                removeOrganizerFromAttendees(item.organizer, item.attendees),
                CALENDAR_METHOD.REQUEST,
                body.inviteMessage
              )
            )
          );
        }
      }
    });

    await Promise.all(emailPromises);

    return res.json(response);
  } catch (e) {
    logger.error('Duplicate multiple calDav events error', e, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);

    next(e);
  }
};
