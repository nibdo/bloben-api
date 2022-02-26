import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import CalDavAccountRepository, {
  CalDavAccount,
} from '../../../data/repository/CalDavAccountRepository';

export const deleteCalDavAccount = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;

  const calDavAccount: CalDavAccount | null =
    await CalDavAccountRepository.getByID(id, userID);

  if (!calDavAccount) {
    throw throwError(404, 'Account not found', req);
  }

  await CalDavAccountRepository.getRepository().delete(calDavAccount.id);

  return createCommonResponse('CalDav account deleted', {
    id: calDavAccount.id,
  });
};
