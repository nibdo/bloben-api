import { Request } from 'express';

import { GetSessionResponse } from '../../../bloben-interface/user/user';
import { SESSION } from '../../../utils/enums';

export const getSession = async (req: Request): Promise<GetSessionResponse> => {
  const userID: string = req.session[SESSION.USER_ID];

  if (!userID) {
    return {
      userID: null,
      isLogged: false,
      username: null,
    };
  }

  return {
    userID,
    isLogged: true,
    username: null,
  };
};
