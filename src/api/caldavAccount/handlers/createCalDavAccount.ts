import { Request, Response } from 'express';

import { BULL_QUEUE, LOG_TAG } from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { CreateCalDavAccountRequest } from '../../../bloben-interface/calDavAccount/calDavAccount';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createAccount } from 'tsdav';
import { createAuthHeader, loginToCalDav } from '../../../service/davService';
import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountEntity from '../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import logger from '../../../utils/logger';

export const createCalDavAccount = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const body: CreateCalDavAccountRequest = req.body;

  const { username, password, url } = body;

  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  // check if account exists
  const existingAccount = await CalDavAccountRepository.getByUrlAndUsername(
    username,
    url,
    user.id
  );

  if (existingAccount) {
    throw throwError(409, 'Account already exists', req);
  }

  await loginToCalDav(url, {
    username,
    password,
  });

  try {
    const responseAccount = await createAccount({
      account: {
        serverUrl: url,
        accountType: 'caldav',
      },
      headers: {
        authorization: createAuthHeader(username, password),
      },
    });

    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // create account
    const calDavAccount: CalDavAccountEntity = new CalDavAccountEntity(
      body,
      user
    );

    calDavAccount.principalUrl = responseAccount.principalUrl;
    calDavAccount.accountType = responseAccount.accountType;
    calDavAccount.data = JSON.stringify(responseAccount);

    await queryRunner.manager.save(calDavAccount);

    // // create calendars
    // const serverCalendars = await client.fetchCalendars({});
    //
    // const promises: any = [];
    // forEach(serverCalendars, (item) => {
    //   promises.push(createCalDavCalendar(item, calDavAccount, queryRunner));
    // });
    // await Promise.all(promises);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID: user.id });

    return createCommonResponse('CalDav account created', {
      id: calDavAccount.id,
    });
  } catch (e) {
    logger.error('Create calDav account error', e, [
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
