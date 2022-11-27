import { Request, Response } from 'express';

import {
  Attendee,
  CommonResponse,
  CreateCalDavEventRequest,
} from 'bloben-interface';
import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { DavService } from '../../../../service/davService';
import { InviteService } from '../../../../service/InviteService';
import { cardDavBullQueue } from '../../../../service/BullQueue';
import { createCommonResponse } from '../../../../utils/common';
import { createEventFromCalendarObject } from '../../../../utils/davHelper';
import { createVCard, fetchCalendarObjects } from 'tsdav';
import { forEach, map } from 'lodash';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { io } from '../../../../app';
import { parseVcardToString } from '../../../../utils/vcardParser';
import { processCaldavAlarms } from './updateCalDavEvent';
import { throwError } from '../../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CalDavEventEntity from '../../../../data/entity/CalDavEventEntity';
import CalendarSettingsRepository from '../../../../data/repository/CalendarSettingsRepository';
import CardDavAddressBookRepository from '../../../../data/repository/CardDavAddressBookRepository';
import CardDavContactRepository from '../../../../data/repository/CardDavContactRepository';
import logger from '../../../../utils/logger';

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

  const davRequestData = getDavRequestData(account);
  const { davHeaders } = davRequestData;

  const response = await createVCard({
    headers: davHeaders,
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
): string[] => {
  return map(
    attendees.filter((item) => item.mailto !== organizer.mailto),
    'mailto'
  );
};

export const removeOrganizerFromAttendeesOriginalData = (
  organizer: Attendee,
  attendees: Attendee[]
): Attendee[] => {
  return attendees.filter((item) => item.mailto !== organizer.mailto);
};

export const excludeEmailsFromAttendees = (
  excludedEmails: string[],
  attendees: Attendee[]
): Attendee[] => {
  return attendees.filter((item) => !excludedEmails.includes(item.mailto));
};

export const createCalDavEvent = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | undefined;
  let queryRunner: QueryRunner | undefined;

  const { userID } = res.locals;
  const body: CreateCalDavEventRequest = req.body;

  const { response, calDavAccount, davRequestData } =
    await DavService.createEvent(
      userID,
      body.calendarID,
      body.externalID,
      body.iCalString
    );

  const fetchedEvents = await fetchCalendarObjects({
    calendar: calDavAccount.calendar,
    objectUrls: [response.url],
    headers: davRequestData.davHeaders,
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
      await InviteService.createEvent(
        eventTemp,
        userID,
        body.iCalString,
        body.inviteMessage
      );
    }

    if (newEvent.attendees?.length) {
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
