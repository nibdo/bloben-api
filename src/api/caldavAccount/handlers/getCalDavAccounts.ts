import { Request, Response } from 'express';

import { GetCalDavAccountResponse } from '../../../bloben-interface/calDavAccount/calDavAccount';
import { map } from 'lodash';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';

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
        c.url as url,
        c.principal_url as "principalUrl"
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
  }));
};
