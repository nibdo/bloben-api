import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createElectronUser } from './handlers/createElectronUser';
import { createElectronUserSchema } from './schemas/createElectronUserSchema';
import { deleteElectronUser } from './handlers/deleteElectronUser';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { ping } from './handlers/ping';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';

const ElectronUserRouter: Router = Router();

ElectronUserRouter.post(
  `/`,
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createElectronUserSchema),
  ],
  createElectronUser
);

ElectronUserRouter.delete(
  `/`,
  [rateLimiterMiddleware(RATE_LIMIT.DEFAULT), celebrate(emptySchema)],
  deleteElectronUser
);

ElectronUserRouter.get('/ping', ping);

export default ElectronUserRouter;
