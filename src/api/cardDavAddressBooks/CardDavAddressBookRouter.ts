import { RATE_LIMIT } from '../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { emptySchema } from '../../common/schemas/emptySchema';
import { getCardDavAddressBooks } from './handlers/getCardDavAddressBooks';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CardDavAddressBookRouter: Router = Router();

CardDavAddressBookRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  getCardDavAddressBooks
);

export default CardDavAddressBookRouter;
