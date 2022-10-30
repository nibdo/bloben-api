import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createCardDavContact } from './handlers/createCardDavContact';
import { createCardDavContactSchema } from './schemas/createCardDavContactSchema';
import { deleteCardDavContact } from './handlers/deleteCardDavContact';
import { deleteCardDavContactSchema } from './schemas/deleteCardDavContactSchema';
import { getCardDavContacts } from './handlers/getCardDavContacts';
import { getCardDavContactsSchema } from './schemas/getCardDavContactsSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { searchCardDavContact } from './handlers/searchCardDavContact';
import { searchCardDavContactSchema } from './schemas/searchCardDavContactSchema';

const CardDavContactRoutes: Router = Router();

CardDavContactRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createCardDavContactSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  createCardDavContact
);

CardDavContactRoutes.get(
  '/search',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(searchCardDavContactSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  searchCardDavContact
);

CardDavContactRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getCardDavContactsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  getCardDavContacts
);

CardDavContactRoutes.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteCardDavContactSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  deleteCardDavContact
);

export default CardDavContactRoutes;
