import { EntityRepository, Repository, getRepository } from 'typeorm';

import { ROLE } from '../../bloben-interface/enums';
import UserEntity from '../entity/UserEntity';

@EntityRepository(UserEntity)
export default class UserRepository extends Repository<UserEntity> {
  public static getRepository = () => getRepository(UserEntity);

  public static async findByUsername(username: string) {
    return getRepository(UserEntity).findOne({
      where: { username },
      select: [
        'id',
        'username',
        'role',
        'hash',
        'isEnabled',
        'isTwoFactorEnabled',
        'twoFactorSecret',
      ],
    });
  }

  public static async getUserForAuth(userID: string) {
    return getRepository(UserEntity).findOne({
      where: { id: userID },
      select: ['id', 'username', 'role', 'hash'],
    });
  }

  public static async findById(userID: string) {
    return getRepository(UserEntity).findOne({
      where: { id: userID },
      select: [
        'id',
        'username',
        'role',
        'hash',
        'isEnabled',
        'isTwoFactorEnabled',
        'twoFactorSecret',
        'emailsAllowed',
      ],
    });
  }

  public static async findAdminById(userID: string) {
    return getRepository(UserEntity).findOne({
      where: { id: userID, role: ROLE.ADMIN },
      select: [
        'id',
        'username',
        'role',
        'hash',
        'isEnabled',
        'isTwoFactorEnabled',
        'twoFactorSecret',
        'emailsAllowed',
      ],
    });
  }

  public static async create(data: UserEntity) {
    return getRepository(UserEntity).create(data);
  }
  public static async update(data: UserEntity) {
    return getRepository(UserEntity).update({ id: data.id }, data);
  }
}
