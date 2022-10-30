import { Router } from 'express';

import * as ServerSettingsController from './ServerSettingsController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../../app/auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { patchServerSettingsSchema } from './schemas/patchServerSettingsSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { userMiddleware } from '../../../middleware/userMiddleware';

const ServerSettingsRoutes: Router = Router();

ServerSettingsRoutes.get(
  '/user',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  ServerSettingsController.getServerSettingsUser
);

ServerSettingsRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
  ],
  ServerSettingsController.getServerSettings
);
ServerSettingsRoutes.patch(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(patchServerSettingsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
  ],
  ServerSettingsController.patchServerSettings
);

export default ServerSettingsRoutes;
