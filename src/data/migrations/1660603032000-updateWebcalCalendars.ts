import {
  Connection,
  MigrationInterface,
  QueryRunner,
  getConnection,
} from 'typeorm';
import { LOG_TAG } from '../../utils/enums';
import { forEach } from 'lodash';
import WebcalCalendarEntity from '../entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../repository/WebcalCalendarRepository';
import logger from '../../utils/logger';

export class UpdateWebcalCalendars1660603032000 implements MigrationInterface {
  public async up(): Promise<void> {
    let connection: Connection | null;
    let queryRunner: QueryRunner | null;

    try {
      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const webcalCalendars =
        await WebcalCalendarRepository.getRepository().find();

      const promises: any = [];

      forEach(webcalCalendars, (item) => {
        const newSyncFrequency = Number((item.syncFrequency / 60).toFixed(0));
        promises.push(
          queryRunner.manager.update(
            WebcalCalendarEntity,
            {
              id: item.id,
            },
            {
              syncFrequency: newSyncFrequency <= 1 ? 1 : newSyncFrequency,
            }
          )
        );
      });

      await Promise.all(promises);

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (e) {
      logger.error('Migration 1660603032000 error', e, [LOG_TAG.UNKNOWN]);
      if (queryRunner) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }

      throw Error('Migration 1660603032000 error');
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
