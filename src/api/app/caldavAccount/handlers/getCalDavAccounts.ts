import { Request, Response } from 'express';

import { GetCalDavAccountResponse } from 'bloben-interface';
import { map } from 'lodash';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';

export const getCalDavAccounts = async (
  req: Request,
  res: Response
): Promise<GetCalDavAccountResponse[]> => {
  const { userID } = res.locals;

  const accounts: any = await CalDavAccountRepository.getRepository().query(
    `
      SELECT 
        c.id as id, 
        c.username as username, 
        c.server_url as "url",
        c.principal_url as "principalUrl",
        c.account_type as "accountType"
      FROM 
        caldav_accounts c
      WHERE
        c.user_id = $1
        AND c.deleted_at IS NULL;
    `,
    [userID]
  );

  return map(accounts, (account) => ({
    id: account.id,
    username: account.username,
    password: '*******',
    url: account.url,
    principalUrl: account.principalUrl,
    accountType: account.accountType,
  }));
};
