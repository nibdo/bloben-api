import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getProfile } from './handlers/getProfile';
import { patchProfile } from './handlers/patchProfile';
import { patchProfileSchema } from './schemas/patchProfileSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../middleware/validationMiddleware';

const ProfileRoutes: Router = Router();

ProfileRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  getProfile
);

ProfileRoutes.patch(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(patchProfileSchema),
  ],
  patchProfile
);

export default ProfileRoutes;
