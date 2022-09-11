import { Connection, QueryRunner, getConnection } from 'typeorm';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { CommonResponse, LoginRequest } from 'bloben-interface';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import logger from '../../../../utils/logger';

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  const { userID } = res.locals;

  const body: LoginRequest = req.body;

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  let isPasswordMatching = false;

  // compare hashed password
  isPasswordMatching = await bcrypt.compare(body.password, user.hash);

  if (!isPasswordMatching) {
    throw throwError(409, 'Wrong password', req);
  }

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    await queryRunner.manager.delete(UserEntity, { id: user.id });

    await queryRunner.commitTransaction();
    await queryRunner.release();

    return createCommonResponse('Account deleted');
  } catch (e) {
    logger.error('Delete user error', e, [LOG_TAG.REST]);
    if (queryRunner !== null) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw e;
    }
  }
};
