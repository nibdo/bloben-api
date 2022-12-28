import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import {
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountEntity from '../../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';

import { socketService } from '../../../../service/init';
import CalendarSettingsEntity from '../../../../data/entity/CalendarSettings';
import CalendarSettingsRepository from '../../../../data/repository/CalendarSettingsRepository';
import CardDavAddressBookRepository from '../../../../data/repository/CardDavAddressBookRepository';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import logger from '../../../../utils/logger';

export const deleteCalDavAccount = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  const { userID } = res.locals;
  const { id } = req.params;

  const [useEmailConfig, calDavAccount] = await Promise.all([
    UserEmailConfigRepository.findByUserIDAndAccountID(userID, id),
    CalDavAccountRepository.getByIDAllTypes(id, userID),
  ]);

  if (!calDavAccount) {
    throw throwError(404, 'Account not found', req);
  }

  if (useEmailConfig) {
    throw throwError(
      409,
      'Cannot delete account with calendar used for importing email invites'
    );
  }

  try {
    const calendarSettings: {
      id: string | null;
    }[] = await CalendarSettingsRepository.getRepository().query(
      `
      SELECT 
        cs.default_address_book_id as id
      FROM calendar_settings cs
      INNER JOIN carddav_address_books ab ON ab.id = cs.default_address_book_id
      WHERE
        cs.user_id = $1 
    `,
      [userID]
    );

    let newAddressBookDefaultID: string | null = null;

    // set new default address book
    if (calendarSettings?.[0]?.id) {
      const newAddressBookDefault: { id: string }[] =
        await CardDavAddressBookRepository.getRepository().query(
          `
      SELECT 
        ab.id as id
      FROM carddav_address_books ab
      INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
      WHERE
        ca.id != $1
        AND ab.deleted_at IS NULL
        AND ca.deleted_at IS NULL
    `,
          [id]
        );

      if (newAddressBookDefault?.[0]?.id) {
        newAddressBookDefaultID = newAddressBookDefault?.[0]?.id;
      }
    }

    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // handle default address book change
    if (newAddressBookDefaultID) {
      await queryRunner.manager.update(CalendarSettingsEntity, userID, {
        defaultAddressBookID: newAddressBookDefaultID,
      });
    } else {
      await queryRunner.manager.update(CalendarSettingsEntity, userID, {
        defaultAddressBookID: null,
      });
    }

    await queryRunner.manager.delete(CalDavAccountEntity, calDavAccount.id);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    socketService.emit(
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_EVENTS }),
      SOCKET_CHANNEL.SYNC,
      `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
    );
    socketService.emit(
      JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS }),
      SOCKET_CHANNEL.SYNC,
      `${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`
    );

    return createCommonResponse('CalDav account deleted', {
      id: calDavAccount.id,
    });
  } catch (error) {
    logger.error('Delete calDav account error', error, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);

    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    throw throwError(500, 'Unknown error', req);
  }
};
