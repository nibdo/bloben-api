import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { filter } from 'lodash';
import { throwError } from '../../../../utils/errorCodes';
import Logger from '../../../../utils/logger';
import UserEmailConfigEntity from '../../../../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';

export const deleteUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;

  const userEmailConfig = await UserEmailConfigRepository.findByUserIDAndID(
    userID,
    id
  );

  if (!userEmailConfig) {
    throw throwError(404, 'User email config not found', req);
  }

  let newDefaultConfig: string | undefined;

  if (userEmailConfig.isDefault) {
    const otherConfigs = await UserEmailConfigRepository.findByUserID(userID);
    const otherConfigsFiltered = filter(
      otherConfigs,
      (item) => item.id !== userEmailConfig.id
    );

    if (otherConfigsFiltered?.length) {
      newDefaultConfig = otherConfigsFiltered[0].id;
    }
  }

  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await queryRunner.manager.delete(UserEmailConfigEntity, {
      id: userEmailConfig.id,
    });

    if (newDefaultConfig) {
      Logger.info(
        `[EMAIL]: Setting new default config to ${newDefaultConfig}`,
        [LOG_TAG.EMAIL]
      );
      await queryRunner.manager.update(
        UserEmailConfigEntity,
        {
          id: newDefaultConfig,
        },
        {
          isDefault: true,
        }
      );
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();

    return createCommonResponse('User email config deleted');
  } catch (error) {
    Logger.error('[Error]: Delete user email config', error);

    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    throw throwError(500, 'Unknown error', req);
  }
};
