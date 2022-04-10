import { EntityRepository, Repository, getRepository } from 'typeorm';

import CalDavEventAlarmEntity from '../entity/CalDavEventAlarmEntity';
import CalDavEventEntity from '../entity/CalDavEventEntity';

@EntityRepository(CalDavEventAlarmEntity)
export default class CalDavEventAlarmRepository extends Repository<CalDavEventAlarmEntity> {
  public static getRepository() {
    return getRepository(CalDavEventEntity);
  }
}
