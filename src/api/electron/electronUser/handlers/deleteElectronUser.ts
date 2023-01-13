import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { ROLE } from '../../../../data/types/enums';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserRepository from '../../../../data/repository/UserRepository';

export const deleteElectronUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get user
    const existingUsers = await UserRepository.getRepository().query(
      `SELECT 
                u.id as id
               FROM users u
               WHERE u.role != $1`,
      [ROLE.ADMIN]
    );

    if (!existingUsers.length) {
      throw throwError(404, 'User not found');
    }

    await UserRepository.getRepository().delete(existingUsers[0].id);

    const response: CommonResponse = createCommonResponse('User deleted');

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
