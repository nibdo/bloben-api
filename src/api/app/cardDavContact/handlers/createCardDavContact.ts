import { NextFunction, Request, Response } from 'express';

import { CommonResponse, CreateCardDavContactRequest } from 'bloben-interface';
import { LOG_TAG } from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { loginToCalDav } from '../../../../service/davService';
import {
  parseFromVcardString,
  parseVcardToString,
} from '../../../../utils/vcardParser';
import { throwError } from '../../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';
import CardDavAddressBookRepository from '../../../../data/repository/CardDavAddressBookRepository';
import CardDavContact from '../../../../data/entity/CardDavContact';
import CardDavContactRepository from '../../../../data/repository/CardDavContactRepository';
import logger from '../../../../utils/logger';

export const createCardDavContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;
    const body: CreateCardDavContactRequest = req.body;

    // get account
    const calDavAccounts = await CalDavAccountRepository.getCardDavAccounts(
      userID,
      body.addressBookID
    );

    if (!calDavAccounts.length) {
      throw throwError(404, 'Account not found');
    }

    const addressBook = await CardDavAddressBookRepository.getByID(
      body.addressBookID,
      userID
    );

    if (!addressBook) {
      throw throwError(404, 'Address book not found');
    }

    const calDavAccount = calDavAccounts[0];

    const client = await loginToCalDav(calDavAccount);

    const id = v4();

    const davResponse = await client.createVCard({
      addressBook: addressBook.data,
      filename: `${id}.ics`,
      vCardString: parseVcardToString(
        id,
        body.email,
        body.fullName || body.email
      ),
    });

    if (davResponse.status >= 300) {
      logger.error(
        `Status: ${davResponse.status} Message: ${davResponse.statusText}`,
        null,
        [LOG_TAG.CARDDAV, LOG_TAG.REST]
      );
      throw throwError(409, `Cannot create contact: ${davResponse.statusText}`);
    }

    const vcards = await client.fetchVCards({
      objectUrls: [davResponse.url],
      addressBook: addressBook.data,
    });

    const vcard = vcards?.[0];

    if (vcard) {
      const parsedResult = parseFromVcardString(vcard.data);
      const newContact = new CardDavContact(
        {
          data: parsedResult,
          etag: vcard.etag,
          url: vcard.url,
        },
        addressBook.id
      );

      await CardDavContactRepository.getRepository().save(newContact);
    }

    const response: CommonResponse = createCommonResponse('Contact created');

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
