import { NextFunction, Request, Response } from 'express';

import { CommonResponse, CreateElectronUserRequest } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { ROLE } from '../../../../data/types/enums';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalendarSettingsEntity from '../../../../data/entity/CalendarSettings';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcryptjs';

export const createElectronUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  try {
    // get user
    const existingUsers = await UserRepository.getRepository().query(
      `SELECT 
                u.id 
               FROM users u
               WHERE u.role != $1`,
      [ROLE.ADMIN]
    );

    if (existingUsers.length) {
      throw throwError(409, 'Cannot create more than one user');
    }

    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const body: CreateElectronUserRequest = req.body;

    const user = new UserEntity(undefined);
    user.id = v4();
    user.username = body.username;
    user.isEnabled = true;
    user.role = ROLE.USER;

    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);
    user.hash = await bcrypt.hashSync(body.username, salt);

    await queryRunner.manager.save(user);

    const calendarSettings = new CalendarSettingsEntity();
    calendarSettings.user = user;

    await queryRunner.manager.save(calendarSettings);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    const response: CommonResponse = createCommonResponse('User created');

    return res.json(response);
  } catch (error) {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    next(error);
  }
};
