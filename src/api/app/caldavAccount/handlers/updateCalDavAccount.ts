import { Request, Response } from 'express';

import { CommonResponse, UpdateCalDavAccountRequest } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import { createDavClient } from '../../../../service/davService';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository, {
  CalDavAccount,
} from '../../../../data/repository/CalDavAccountRepository';

export const updateCalDavAccount = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;
  const body: UpdateCalDavAccountRequest = req.body;

  const { password } = body;

  const calDavAccount: CalDavAccount | null =
    await CalDavAccountRepository.getByIDAllTypes(id, userID);

  if (!calDavAccount) {
    throw throwError(404, 'Account not found', req);
  }

  try {
    // check connection with new password
    const client = createDavClient(calDavAccount.url, {
      username: calDavAccount.username,
      password,
    });
    await client.login();
  } catch (e) {
    throw throwError(409, 'Cannot connect to calDav server', req);
  }

  await CalDavAccountRepository.getRepository().update(calDavAccount.id, {
    password,
  });

  return createCommonResponse('CalDav account updated', {
    id: calDavAccount.id,
  });
};
