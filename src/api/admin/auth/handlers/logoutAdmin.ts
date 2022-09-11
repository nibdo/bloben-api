import { Request } from 'express';

import { CommonResponse } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';

export const logoutAdmin = async (req: Request): Promise<CommonResponse> => {
  req.session.destroy(function (err) {
    if (err) {
      throw throwError(500, 'Unknown error', req);
    }
  });

  return createCommonResponse();
};
