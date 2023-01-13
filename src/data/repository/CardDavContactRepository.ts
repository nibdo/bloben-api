import { EntityRepository, Repository, getRepository } from 'typeorm';

import {
  createArrayQueryReplacement,
  getOneResult,
  parseToJSON,
} from '../../utils/common';
import { map } from 'lodash';
import CardDavContact from '../entity/CardDavContact';

@EntityRepository(CardDavContact)
export default class CardDavContactRepository extends Repository<CardDavContact> {
  public static getRepository = () => getRepository(CardDavContact);

  public static async findByUserIdAndUrls(userID: string, urls: string[]) {
    const rawResult: { id: string; etag: string; url: string }[] =
      await this.getRepository().query(
        `
    SELECT
        c.id as id,
        c.etag as etag,
        c.url as url
    FROM carddav_contacts c
    INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ca.user_id = $1
        AND c.url IN (${createArrayQueryReplacement(urls, 2)})
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
        [userID, ...urls]
      );

    return rawResult;
  }

  public static async findByUserIdAndEmail(userID: string, email: string) {
    const rawResult: { id: string; etag: string; url: string }[] =
      await this.getRepository().query(
        `
    SELECT
        c.id as id
    FROM carddav_contacts c
    INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        c.emails LIKE $1
        AND ca.user_id = $2
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
        [`%${email}%`, userID]
      );

    return rawResult;
  }

  public static async getByID(userID: string, id: string) {
    const rawResult: {
      id: string;
      etag: string;
      addressBookID: string;
      url: string;
    }[] = await this.getRepository().query(
      `
    SELECT
        c.id as id,
        c.url as url,
        c.etag as etag,
        ab.id as "addressBookID"
    FROM carddav_contacts c
    INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        c.id = $1
        AND ca.user_id = $2
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
      [id, userID]
    );

    return getOneResult(rawResult);
  }

  public static async search(userID: string, text: string) {
    const rawResult: { id: string; fullName: string; emails: string }[] =
      await this.getRepository().query(
        `
    SELECT
        c.id as id,
        c.full_name as "fullName",
        c.emails as emails
    FROM carddav_contacts c
    INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        c.emails LIKE $1
        OR c.full_name LIKE $1
        AND ca.user_id = $2
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
        [`%${text}%`, userID]
      );

    return rawResult;
  }

  public static async getByAddressBookID(
    userID: string,
    addressBookID: string
  ) {
    const rawResult: { id: string; fullName: string; emails: string[] }[] =
      await this.getRepository().query(
        `
    SELECT
        c.id as id,
        c.full_name as "fullName",
        c.emails as emails
    FROM carddav_contacts c
    INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ca.user_id = $1
        AND ab.id = $2
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL           
        `,
        [userID, addressBookID]
      );

    return map(rawResult, (item) => ({
      ...item,
      emails: parseToJSON(item.emails),
    }));
  }

  public static async getNewest(userID: string) {
    const rawResult: { id: string; fullName: string; emails: string }[] =
      await this.getRepository().query(
        `
    SELECT
        c.id as id,
        c.full_name as "fullName",
        c.emails as emails
    FROM carddav_contacts c
    INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
    INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
    WHERE
        ca.user_id = $1
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
        AND ab.deleted_at IS NULL    
    GROUP BY
        c.id,
        c.full_name,
        c.emails
    ORDER BY
        c.created_at DESC
    LIMIT 20
        `,
        [userID]
      );

    return rawResult;
  }
}
