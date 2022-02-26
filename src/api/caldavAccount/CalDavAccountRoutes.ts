import { Router } from 'express';

import * as CalDavAccountController from './CalDavAccountController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createCalDavAccount } from './schemas/createCalDavAccount';
import { emptySchema } from '../../common/schemas/emptySchema';
import { getCalDavAccount } from './schemas/getCalDavAccount';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { updateCalDavAccount } from './schemas/updateCalDavAccount';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CalDavAccountRouter: Router = Router();

CalDavAccountRouter.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(createCalDavAccount),
  ],
  CalDavAccountController.createCalDavAccount
);
CalDavAccountRouter.get(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getCalDavAccount),
  ],
  CalDavAccountController.getCalDavAccount
);
CalDavAccountRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  CalDavAccountController.getCalDavAccounts
);
CalDavAccountRouter.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(updateCalDavAccount),
  ],
  CalDavAccountController.updateCalDavAccount
);
CalDavAccountRouter.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(getCalDavAccount),
  ],
  CalDavAccountController.deleteCalDavAccount
);

export default CalDavAccountRouter;
