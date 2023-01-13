import { NextFunction, Request, Response } from 'express';

import { DuplicateMultipleCalDavEventsBody } from 'bloben-interface';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import {
  createCommonResponse,
  handleDavResponse,
} from '../../../../utils/common';

import { CalDavEventObj } from '../../../../utils/davHelper';
import { DateTime } from 'luxon';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import { Job } from 'bullmq';
import { electronService, socketService } from '../../../../service/init';
import {
  eventResultToCalDavEventObj,
  formatEventRawToResult,
} from '../../../../utils/format';
import { find, forEach } from 'lodash';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { syncCalDavQueueJob } from '../../../../jobs/queueJobs/syncCalDavQueueJob';
import { throwError } from '../../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventRepository from '../../../../data/repository/CalDavEventRepository';
import ICalHelperV2 from '../../../../utils/ICalHelperV2';
import LuxonHelper from '../../../../utils/luxonHelper';
import logger from '../../../../utils/logger';

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
      let startAtNew = DateTime.fromFormat(date, 'dd-MM-yyyy');

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

    const davRequestData = getDavRequestData(calDavAccount);

    const promises: any = [];

    forEach(iCalStrings, (item) => {
      promises.push(
        DavService.createEventRaw(
          item.data,
          item.id,
          calDavAccount,
          davRequestData
        )
      );
    });

    const davResponses = await Promise.all(promises);

    forEach(davResponses, (response) => {
      handleDavResponse(response, 'Duplicate event error');
    });

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
      data: { userID },
    } as Job);

    const response = createCommonResponse(
      `${successes} events created${failed > 0 ? `, ${failed} failed` : ''}`
    );

    socketService.emit(
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
      SOCKET_CHANNEL.SYNC,
      `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
    );

    const emailPromises: any = [];

    forEach(calDavObjs, (item) => {
      if (item.attendees?.length && body.sendInvite) {
        const icalString = find(
          iCalStrings,
          (itemIcal) => item.externalID === itemIcal.id
        );

        if (icalString) {
          emailPromises.push(
            InviteService.createEvent(
              item,
              userID,
              icalString.data,
              body.inviteMessage
            )
          );
        }
      }
    });

    await Promise.all(emailPromises);

    await electronService.processWidgetFile();

    return res.json(response);
  } catch (e) {
    logger.error('Duplicate multiple calDav events error', e, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);

    next(e);
  }
};
