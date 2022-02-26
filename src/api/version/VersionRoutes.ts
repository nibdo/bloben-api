import { Router } from 'express';

import { RATE_LIMIT } from '../../utils/enums';
import { emptySchema } from '../../common/schemas/emptySchema';
import { getVersionController } from './VersionController';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const VersionRouter: Router = Router();

VersionRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    validationMiddleware(emptySchema),
  ],
  getVersionController
);

export default VersionRouter;
