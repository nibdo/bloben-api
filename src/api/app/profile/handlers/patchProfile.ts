import { NextFunction, Request, Response } from 'express';

import { PatchProfileRequest } from 'bloben-interface';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const patchProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body: PatchProfileRequest = req.body;
    const { userID } = res.locals;

    const user: UserEntity | undefined = await UserRepository.findById(userID);

    if (!user) {
      throw throwError(404, 'User not found', req);
    }

    if (body.language) {
      user.language = body.language;
    }

    await UserRepository.update(user);

    const response = createCommonResponse('Profile updated');

    return res.send(response);
  } catch (error) {
    next(error);
  }
};
