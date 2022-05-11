import {
  Connection,
  MigrationInterface,
  QueryRunner,
  getConnection,
} from 'typeorm';
import { LOG_TAG } from '../../utils/enums';
import { ROLE } from '../../bloben-interface/enums';
import { forEach } from 'lodash';
import UserEntity from '../entity/UserEntity';
import UserRepository from '../repository/UserRepository';
import logger from '../../utils/logger';

export class EmailsAllowed1670603032000 implements MigrationInterface {
  public async up(): Promise<void> {
    let connection: Connection | null;
    let queryRunner: QueryRunner | null;

    try {
      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const users = await UserRepository.getRepository().find();

      const promises: any = [];

      forEach(users, (user) => {
        if (user.role === ROLE.DEMO) {
          promises.push(
            queryRunner.manager.update(UserEntity, user.id, {
              emailsAllowed: false,
            })
          );
        }
      });

      await Promise.all(promises);

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (e) {
      logger.error('Migration EmailsAllowed1670603032000 error', e, [
        LOG_TAG.UNKNOWN,
      ]);
      if (queryRunner) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }

      throw Error('Migration EmailsAllowed1670603032000 error');
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
