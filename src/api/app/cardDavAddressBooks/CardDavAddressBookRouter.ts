import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getCardDavAddressBooks } from './handlers/getCardDavAddressBooks';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const CardDavAddressBookRouter: Router = Router();

CardDavAddressBookRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  getCardDavAddressBooks
);

export default CardDavAddressBookRouter;
