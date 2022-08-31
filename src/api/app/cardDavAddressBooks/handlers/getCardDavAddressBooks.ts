import { NextFunction, Request, Response } from 'express';

import { GetCardDavAddressBooks } from '../../../../bloben-interface/cardDavAddressBook/cardDavAddressBook';
import CardDavAddressBookRepository from '../../../../data/repository/CardDavAddressBookRepository';

export const getCardDavAddressBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;

    const response: GetCardDavAddressBooks[] =
      await CardDavAddressBookRepository.getRepository().query(
        `
        SELECT
          ab.id as id,
          ab.display_name as "displayName",
          ca.id as "accountID"
        FROM carddav_address_books ab
        INNER JOIN caldav_accounts ca ON ab.caldav_account_id = ca.id
        WHERE
            ab.deleted_at IS NULL
            AND ca.deleted_at IS NULL
            AND ca.user_id = $1
    `,
        [userID]
      );

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
