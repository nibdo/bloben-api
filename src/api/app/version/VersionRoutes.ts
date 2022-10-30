import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getVersionController } from './VersionController';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';

const VersionRouter: Router = Router();

VersionRouter.get(
  '/',
  [rateLimiterMiddleware(RATE_LIMIT.DEFAULT), celebrate(emptySchema)],
  getVersionController
);

export default VersionRouter;
