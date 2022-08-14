import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import CardDavAddressBook from '../entity/CardDavAddressBook';

@EntityRepository(CardDavAddressBook)
export default class CardDavAddressBookRepository extends Repository<CardDavAddressBook> {
  public static getRepository = () => getRepository(CardDavAddressBook);

  public static async findByUserIdAndUrl(userID: string, url: string) {
    const rawResult: { id: string; ctag: string }[] =
      await this.getRepository().query(
        `
    SELECT
        ab.id as id,
        ab.ctag as ctag
    FROM carddav_address_books ab
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ab.url = $1
        AND ca.user_id = $2
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
        [url, userID]
      );

    return getOneResult(rawResult);
  }

  public static async findAllByUserID(userID: string) {
    const rawResult: { id: string; ctag: string; data: any }[] =
      await this.getRepository().query(
        `
    SELECT
        ab.id as id,
        ab.ctag as ctag,
        ab.data as data
    FROM carddav_address_books ab
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ca.user_id = $1
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
        [userID]
      );

    return rawResult;
  }

  public static async findFirstByUserID(userID: string) {
    const rawResult: { id: string }[] = await this.getRepository().query(
      `
    SELECT
        ab.id as id
    FROM carddav_address_books ab
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ca.user_id = $1
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL
    ORDER BY 
        ab.created_at ASC           
        `,
      [userID]
    );

    return getOneResult(rawResult);
  }

  public static async findFirstByUserIDWithData(userID: string) {
    const rawResult: { id: string; data: any }[] =
      await this.getRepository().query(
        `
    SELECT
        ab.id as id,
        ab.data as data
    FROM carddav_address_books ab
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ca.user_id = $1
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL
    ORDER BY 
        ab.created_at ASC           
        `,
        [userID]
      );

    return getOneResult(rawResult);
  }

  public static async getByID(
    id: string,
    userID: string
  ): Promise<{ id: string; data: any } | null> {
    const result: any = await getRepository(CardDavAddressBook).query(
      `
      SELECT 
        ab.id as id,
        ab.data as data
      FROM 
        carddav_address_books ab
      INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
      WHERE
        ab.id = $1
        AND ca.user_id = $2
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL;
    `,
      [id, userID]
    );

    return getOneResult(result);
  }
}
