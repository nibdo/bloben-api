import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getSyncController } from './SyncController';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../middleware/validationMiddleware';

const SyncRouter: Router = Router();

SyncRouter.get(
  '/',
  [
    authMiddleware,
    rateLimiterMiddleware(RATE_LIMIT.SYNC),
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  getSyncController
);

export default SyncRouter;
