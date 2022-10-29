import { AdminCreateUserRequest, CommonResponse } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { LOG_TAG } from '../../../../utils/enums';
import { Request } from 'express';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import CalendarSettingsEntity from '../../../../data/entity/CalendarSettings';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import logger from '../../../../utils/logger';

export const validateUsername = (username: string) => {
  if (username.includes(' ')) {
    throw throwError(403, 'Username cannot contains spaces');
  }
};

export const adminCreateUser = async (
  req: Request
): Promise<CommonResponse> => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  const body: AdminCreateUserRequest = req.body;

  validateUsername(body.username);

  const user: UserEntity | undefined = await UserRepository.findByUsername(
    body.username
  );

  if (user) {
    throw throwError(409, 'User already exist');
  }

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const newUser: UserEntity = new UserEntity(body);

    // hash user password
    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);
    newUser.hash = await bcrypt.hashSync(body.password, salt);

    await queryRunner.manager.save(newUser);

    const calendarSettings = new CalendarSettingsEntity();
    calendarSettings.user = newUser;

    await queryRunner.manager.save(calendarSettings);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    return createCommonResponse('User created');
  } catch (e) {
    logger.error('Create user error', e, [LOG_TAG.REST, LOG_TAG.ADMIN]);
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
    throw throwError(500, 'Unknown error', req);
  }
};
