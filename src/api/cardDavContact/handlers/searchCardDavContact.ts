import { NextFunction, Request, Response } from 'express';

import { SearchCardDavContactResponse } from '../../../bloben-interface/cardDavContact/cardDavContact';
import { forEach } from 'lodash';
import CardDavContactRepository from '../../../data/repository/CardDavContactRepository';

interface Query {
  text: string;
}

export const searchCardDavContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { text } = req.query as unknown as Query;

    let result;

    if (!text || text.length === 0) {
      result = await CardDavContactRepository.getNewest(userID);
    } else {
      result = await CardDavContactRepository.search(userID, text);
    }

    const response: SearchCardDavContactResponse[] = [];

    forEach(result, (item) => {
      if (item.fullName.includes(text)) {
        forEach(item.emails, (email) => {
          response.push({
            id: item.id,
            email,
          });
        });
      } else {
        forEach(item.emails, (email) => {
          if (email.includes(text)) {
            response.push({
              id: item.id,
              email,
            });
          }
        });
      }
    });

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
