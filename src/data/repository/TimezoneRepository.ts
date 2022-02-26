import { EntityRepository, Repository, getRepository } from 'typeorm';

import TimezoneEntity from '../entity/TimezoneEntity';

@EntityRepository(TimezoneEntity)
export default class TimezoneRepository extends Repository<TimezoneEntity> {
  public static getRepository() {
    return getRepository(TimezoneEntity);
  }
  public static async findAll() {
    return getRepository(TimezoneEntity).find();
  }
}
