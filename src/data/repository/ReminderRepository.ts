import { EntityRepository, Repository, getRepository } from 'typeorm';

import ReminderEntity from '../entity/ReminderEntity';

@EntityRepository(ReminderEntity)
export default class ReminderRepository extends Repository<ReminderEntity> {
  public static getRepository() {
    return getRepository(ReminderEntity);
  }
}
