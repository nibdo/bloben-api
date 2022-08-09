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
import { cardDavBullQueue, emailBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import {
  createEventFromCalendarObject,
  formatInviteData,
} from '../../../utils/davHelper';
import { forEach } from 'lodash';
import { io } from '../../../app';
import { loginToCalDav } from '../../../service/davService';
import { parseVcardToString } from '../../../utils/vcardParser';
import { processCaldavAlarms } from './updateCalDavEvent';
import { throwError } from '../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import CalendarSettingsRepository from '../../../data/repository/CalendarSettingsRepository';
import CardDavAddressBookRepository from '../../../data/repository/CardDavAddressBookRepository';
import CardDavContactRepository from '../../../data/repository/CardDavContactRepository';
import logger from '../../../utils/logger';

export const handleCreateContact = async (
  userID: string,
  addressBookID: string,
  id: string,
  email: string,
  fullName?: string
) => {
  // check if exists
  const existingContact = await CardDavContactRepository.findByUserIdAndEmail(
    userID,
    email
  );

  if (existingContact.length) {
    return;
  }

  const addressBook = await CardDavAddressBookRepository.getByID(
    addressBookID,
    userID
  );

  if (!addressBook) {
    return;
  }

  // get account with addressBook
  const account = await CalDavAccountRepository.getCardDavByAddressBookID(
    addressBook.id,
    userID
  );

  if (!account) {
    return;
  }

  const client = await loginToCalDav(account);

  const response = await client.createVCard({
    addressBook: addressBook.data,
    filename: `${id}.ics`,
    vCardString: parseVcardToString(id, email, fullName),
  });

  if (response.status >= 300) {
    logger.error(
      `Status: ${response.status} Message: ${response.statusText}`,
      null,
      [LOG_TAG.CARDDAV, LOG_TAG.REST]
    );
  }
};

export const removeOrganizerFromAttendees = (
  organizer: { mailto: string },
  attendees: { mailto: string }[]
): any[] => {
  return attendees.filter((item) => item.mailto !== organizer.mailto);
};

export const createCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | undefined;
  let queryRunner: QueryRunner | undefined;

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

  if (!eventTemp) {
    logger.error('Created entity refetch went wrong', eventTemp, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);
    throw throwError(409, 'Created entity refetch went wrong');
  }

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const newEvent = new CalDavEventEntity(eventTemp);

    await queryRunner.manager.save(newEvent);

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

    if (newEvent.attendees && body.sendInvite) {
      await emailBullQueue.add(
        BULL_QUEUE.EMAIL,
        formatInviteData(
          userID,
          eventTemp,
          body.iCalString,
          removeOrganizerFromAttendees(
            eventTemp.organizer,
            eventTemp.attendees
          ),
          CALENDAR_METHOD.REQUEST,
          body.inviteMessage
        )
      );
    }

    if (newEvent.attendees?.length) {
      const settings = await CalendarSettingsRepository.findByUserID(userID);

      if (settings?.saveContactsAuto && settings?.defaultAddressBookID) {
        const carddavPromises: any = [];
        forEach(
          removeOrganizerFromAttendees(
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
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw throwError(500, 'Unknown error', req);
    }
  }
};
