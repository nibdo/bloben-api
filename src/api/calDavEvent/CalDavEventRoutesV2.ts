import { Router } from 'express';

import * as CalDavEventController from './CalDavEventController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { syncRequestSchema } from '../../common/schemas/syncRequestSchema';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CalDavEventRoutesV2: Router = Router();

CalDavEventRoutesV2.get(
  '/sync',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(syncRequestSchema),
  ],
  CalDavEventController.syncCalDavEvents
);

export default CalDavEventRoutesV2;
