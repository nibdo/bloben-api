import * as LogController from './LogController';
import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../../app/auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getLogsSchema } from './schemas/getLogsSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const LogRoutes: Router = Router();

LogRoutes.get(
  '/tags',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  LogController.getLogTags
);

LogRoutes.get(
  '/dates',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  LogController.getLogDates
);

LogRoutes.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getLogsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  LogController.getLogs
);

export default LogRoutes;
