import { Request, Response } from 'express';

import { CommonResponse, CreateCalDavAccountRequest } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { DAV_ACCOUNT_TYPE } from '../../../../data/types/enums';
import { LOG_TAG } from '../../../../utils/enums';
import { QueueClient } from '../../../../service/init';
import { createAccount } from 'tsdav';
import { createAuthHeader } from '../../../../service/davService';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountEntity from '../../../../data/entity/CalDavAccount';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import logger from '../../../../utils/logger';

export const createCalDavAccount = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { user } = res.locals;
  const body: CreateCalDavAccountRequest = req.body;

  const { username, password, url, accountType } = body;

  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  // check if account exists
  const existingAccount = await CalDavAccountRepository.getByUrlAndUsername(
    username,
    url,
    user.id,
    accountType
  );

  if (existingAccount) {
    throw throwError(409, 'Account already exists', req);
  }

  let responseAccount;
  try {
    responseAccount = await createAccount({
      account: {
        serverUrl: url,
        accountType,
      },
      headers: {
        authorization: createAuthHeader(username, password),
      },
    });
  } catch (e) {
    logger.error('Cannot connect to Dav server', e, [
      LOG_TAG.REST,
      LOG_TAG.CALDAV,
    ]);

    throw throwError(409, 'Cannot connect to Dav server');
  }

  try {
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
    calDavAccount.homeUrl = responseAccount.homeUrl;
    calDavAccount.rootUrl = responseAccount.rootUrl;
    calDavAccount.serverUrl = responseAccount.serverUrl;
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

    if (accountType === DAV_ACCOUNT_TYPE.CALDAV) {
      await QueueClient.syncCalDav(user.id);
    } else {
      await QueueClient.syncCardDav(user.id);
    }

    return createCommonResponse('Account created', {
      id: calDavAccount.id,
    });
  } catch (e) {
    logger.error('Create account error', e, [LOG_TAG.REST, LOG_TAG.CALDAV]);
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
    throw throwError(500, 'Unknown error', req);
  }
};
