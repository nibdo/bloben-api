import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import UserEmailConfigEntity from '../entity/UserEmailConfig';

@EntityRepository(UserEmailConfigEntity)
export default class UserEmailConfigRepository extends Repository<UserEmailConfigEntity> {
  public static getRepository = () => getRepository(UserEmailConfigEntity);

  public static async findByUserID(userID: string) {
    return getRepository(UserEmailConfigEntity)
      .createQueryBuilder('ue')
      .innerJoin('users', 'u', 'ue.user_id = :userID', { userID })
      .where('u.id = :userID', { userID })
      .getMany();
  }

  public static async findByUserIDAndID(userID: string, id: string) {
    return getRepository(UserEmailConfigEntity)
      .createQueryBuilder('ue')
      .innerJoin('users', 'u', 'ue.user_id = :userID', { userID })
      .where('u.id = :userID', { userID })
      .andWhere('ue.id = :id', { id })
      .getOne();
  }

  public static async findByUserIDAndAddress(userID: string, address: string) {
    return getRepository(UserEmailConfigEntity)
      .createQueryBuilder('ue')
      .innerJoin('users', 'u', 'ue.user_id = :userID', { userID })
      .where('u.id = :userID', { userID })
      .andWhere(':address = ANY(ue.aliases)', { address })
      .getOne();
  }

  public static async findByUserIDAndImportID(
    userID: string,
    importID: string
  ) {
    const result = await getRepository(UserEmailConfigEntity).query(
      `
        SELECT 
        ec.id
      FROM user_email_config ec
      INNER JOIN caldav_calendars c ON c.id = ec.calendar_for_import_id
      INNER JOIN caldav_accounts a ON a.id = c.caldav_account_id
      WHERE
        ec.user_id = $1
        AND ec.calendar_for_import_id = $2
    `,
      [userID, importID]
    );

    return getOneResult(result);
  }

  public static async findByUserIDAndAccountID(
    userID: string,
    accountID: string
  ) {
    const result = await getRepository(UserEmailConfigEntity).query(
      `
        SELECT 
        ec.id,
        a.id as "accountID"
      FROM user_email_config ec
      INNER JOIN caldav_calendars c ON c.id = ec.calendar_for_import_id
      INNER JOIN caldav_accounts a ON a.id = c.caldav_account_id
      WHERE
        ec.user_id = $1
        AND a.id = $2
    `,
      [userID, accountID]
    );

    return getOneResult(result);
  }
}
