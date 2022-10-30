import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getProfile } from './handlers/getProfile';
import { patchProfile } from './handlers/patchProfile';
import { patchProfileSchema } from './schemas/patchProfileSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const ProfileRoutes: Router = Router();

ProfileRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  getProfile
);

ProfileRoutes.patch(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(patchProfileSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  patchProfile
);

export default ProfileRoutes;
