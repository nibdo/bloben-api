import { Request, Response } from 'express';

import { CommonResponse } from 'bloben-interface';
import { Connection, QueryRunner, getConnection } from 'typeorm';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEmailConfigEntity from '../../../../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../../../../data/repository/UserEmailConfigRepository';
import logger from '../../../../utils/logger';

export const patchUserEmailConfig = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { id } = req.params;

  const config = await UserEmailConfigRepository.findByUserIDAndID(userID, id);

  if (!config) {
    throw throwError(404, 'Email config not found');
  }

  let connection: Connection | null;
  let queryRunner: QueryRunner | null;

  try {
    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await queryRunner.manager.update(
      UserEmailConfigEntity,
      {
        userID,
      },
      {
        isDefault: false,
      }
    );

    await queryRunner.manager.update(
      UserEmailConfigEntity,
      {
        id,
        userID,
      },
      {
        isDefault: true,
      }
    );

    await queryRunner.commitTransaction();
    await queryRunner.release();
  } catch (e) {
    logger.error('Patch email config error', e, [LOG_TAG.EMAIL]);

    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    throw throwError(500, 'Unknown error', req);
  }

  return createCommonResponse('User email config updated');
};
