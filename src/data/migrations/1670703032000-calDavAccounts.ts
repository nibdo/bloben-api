import {
  Connection,
  MigrationInterface,
  QueryRunner,
  getConnection,
} from 'typeorm';
import { LOG_TAG } from '../../utils/enums';
import { forEach } from 'lodash';
import CalDavAccountRepository from '../repository/CalDavAccountRepository';
import logger from '../../utils/logger';

export class CalDavAccounts1670703032000 implements MigrationInterface {
  public async up(): Promise<void> {
    let connection: Connection | null;
    let queryRunner: QueryRunner | null;

    try {
      const accounts = await CalDavAccountRepository.getRepository().find();

      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const promises: any = [];

      forEach(accounts, (account) => {
        const data = JSON.parse(account.data);

        promises.push(
          CalDavAccountRepository.getRepository().update(account.id, {
            serverUrl: data.serverUrl,
            rootUrl: data.rootUrl,
            homeUrl: data.homeUrl,
            principalUrl: data.principalUrl,
          })
        );
      });

      await Promise.all(promises);

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (e) {
      logger.error('Migration CalDavAccounts1670703032000 error', e, [
        LOG_TAG.UNKNOWN,
      ]);
      if (queryRunner) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }

      throw Error('Migration CalDavAccounts1670703032000 error');
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
