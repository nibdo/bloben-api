import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getSyncController, syncEmailsController } from './SyncController';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const SyncRouter: Router = Router();

SyncRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.SYNC),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  getSyncController
);

SyncRouter.get(
  '/emails',
  [
    rateLimiterMiddleware(RATE_LIMIT.SYNC_EMAILS),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  syncEmailsController
);

export default SyncRouter;
