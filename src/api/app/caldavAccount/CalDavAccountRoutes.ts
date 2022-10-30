import { Router } from 'express';

import * as CalDavAccountController from './CalDavAccountController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createCalDavAccount } from './schemas/createCalDavAccount';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getCalDavAccount } from './schemas/getCalDavAccount';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateCalDavAccount } from './schemas/updateCalDavAccount';

const CalDavAccountRouter: Router = Router();

CalDavAccountRouter.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createCalDavAccount),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavAccountController.createCalDavAccount
);
CalDavAccountRouter.get(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getCalDavAccount),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalDavAccountController.getCalDavAccount
);
CalDavAccountRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalDavAccountController.getCalDavAccounts
);
CalDavAccountRouter.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateCalDavAccount),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavAccountController.updateCalDavAccount
);
CalDavAccountRouter.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getCalDavAccount),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavAccountController.deleteCalDavAccount
);

export default CalDavAccountRouter;
