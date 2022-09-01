import { NextFunction, Request, Response } from 'express';

import { GetCardDavContactsResponse } from 'bloben-interface';
import CardDavContactRepository from '../../../../data/repository/CardDavContactRepository';

interface Query {
  addressBookID: string;
}

export const getCardDavContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { addressBookID } = req.query as unknown as Query;

    const response: GetCardDavContactsResponse[] =
      await CardDavContactRepository.getByAddressBookID(userID, addressBookID);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
