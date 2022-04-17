import { EntityRepository, Repository, getRepository } from 'typeorm';

import CalendarSettingsEntity from '../entity/CalendarSettings';

@EntityRepository(CalendarSettingsEntity)
export default class CalendarSettingsRepository extends Repository<CalendarSettingsEntity> {
  public static getRepository = () => getRepository(CalendarSettingsEntity);

  public static async findByUserID(userID: string) {
    return getRepository(CalendarSettingsEntity)
      .createQueryBuilder('cs')
      .innerJoin('users', 'u', 'cs.user_id = :userID', { userID })
      .where('u.id = :userID', { userID })
      .getOne();
  }
}
