import { Request } from 'express';

import { GetSessionResponse } from '../../../../bloben-interface/user/user';
import { SESSION } from '../../../../utils/enums';
import UserRepository from '../../../../data/repository/UserRepository';

export const getSession = async (req: Request): Promise<GetSessionResponse> => {
  const userID: string = req.session[SESSION.USER_ID];

  const user = await UserRepository.getRepository().findOne({
    select: ['username'],
    where: {
      id: userID,
    },
  });

  if (!userID || !user) {
    return {
      userID: null,
      isLogged: false,
      username: null,
    };
  }

  return {
    userID,
    isLogged: true,
    username: user.username,
  };
};
