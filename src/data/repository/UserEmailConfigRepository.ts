import { EntityRepository, Repository, getRepository } from 'typeorm';

import UserEmailConfigEntity from '../entity/UserEmailConfig';

@EntityRepository(UserEmailConfigEntity)
export default class UserEmailConfigRepository extends Repository<UserEmailConfigEntity> {
  public static getRepository = () => getRepository(UserEmailConfigEntity);

  public static async findByUserID(userID: string) {
    return getRepository(UserEmailConfigEntity)
      .createQueryBuilder('ue')
      .innerJoin('users', 'u', 'ue.user_id = :userID', { userID })
      .where('u.id = :userID', { userID })
      .getOne();
  }
}
