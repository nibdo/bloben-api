import { NextFunction, Request, Response } from 'express';

import { GetProfileResponse } from 'bloben-interface';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;

    const user: UserEntity | undefined = await UserRepository.findById(userID);

    if (!user) {
      throw throwError(404, 'User not found', req);
    }

    const response: GetProfileResponse = user.getProfile();

    return res.send(response);
  } catch (error) {
    next(error);
  }
};
