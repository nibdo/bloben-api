import { Request, Response } from 'express';

import { GetCalDavAccountResponse } from '../../../bloben-interface/calDavAccount/calDavAccount';
import { getOneResult } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';

export const getCalDavAccount = async (
  req: Request,
  res: Response
): Promise<GetCalDavAccountResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;

  const accountRaw: any = await CalDavAccountRepository.getRepository().query(
    `
      SELECT 
        c.id as id, 
        c.username as username, 
        c.url as url,
        c.principal_url as "principalUrl",
        c.account_type as "accountType"
      FROM 
        caldav_accounts c
      WHERE
        c.user_id = $1
        AND c.id = $2
        AND c.deleted_at IS NULL;
    `,
    [userID, id]
  );

  const account = getOneResult(accountRaw);

  if (!account) {
    throw throwError(404, 'Account not found', req);
  }

  return {
    id: account.id,
    username: account.username,
    password: '*******',
    url: account.url,
    principalUrl: account.principalUrl,
    accountType: account.accountType,
  };
};
