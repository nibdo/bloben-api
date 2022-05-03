import { Router } from 'express';

import * as ServerSettingsController from './ServerSettingsController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { adminTokenMiddleware } from '../../middleware/adminTokenMiddleware';
import { emptySchema } from '../../common/schemas/emptySchema';
import { patchServerSettingsSchema } from './schemas/patchServerSettingsSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { userMiddleware } from '../../middleware/userMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const ServerSettingsRoutes: Router = Router();

ServerSettingsRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    adminTokenMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    validationMiddleware(emptySchema),
  ],
  ServerSettingsController.getServerSettings
);
ServerSettingsRoutes.patch(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    adminTokenMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    validationMiddleware(patchServerSettingsSchema),
  ],
  ServerSettingsController.patchServerSettings
);

export default ServerSettingsRoutes;
