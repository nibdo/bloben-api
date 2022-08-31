import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../../../bloben-interface/interface';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { loginToCalDav } from '../../../../service/davService';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CardDavContactRepository from '../../../../data/repository/CardDavContactRepository';
import logger from '../../../../utils/logger';

export const deleteCardDavContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const { id } = req.params;

    const contact = await CardDavContactRepository.getByID(userID, id);

    if (!contact) {
      throw throwError(404, 'Contact not found');
    }

    // get account
    const calDavAccounts = await CalDavAccountRepository.getCardDavAccounts(
      userID,
      contact.addressBookID
    );

    if (!calDavAccounts.length) {
      throw throwError(404, 'Account not found');
    }

    const calDavAccount = calDavAccounts[0];

    const client = await loginToCalDav(calDavAccount);

    const davResponse: any = await client.deleteVCard({
      vCard: {
        url: contact.url,
        etag: contact.etag,
      },
    });

    if (davResponse.status >= 300) {
      logger.error(
        `Status: ${davResponse.status} Message: ${davResponse.statusText}`,
        null,
        [LOG_TAG.CARDDAV, LOG_TAG.REST]
      );
      throw throwError(409, `Cannot delete contact: ${davResponse.statusText}`);
    }

    await CardDavContactRepository.getRepository().delete(id);

    const response: CommonResponse = createCommonResponse('Contact deleted');

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
