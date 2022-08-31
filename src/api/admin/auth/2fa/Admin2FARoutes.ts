import * as Admin2FAController from './Admin2FAController';
import { RATE_LIMIT } from '../../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../../../app/auth/UserEnums';
import { authMiddleware } from '../../../../middleware/authMiddleware';
import { emptySchema } from '../../../../common/schemas/emptySchema';
import { enableTwoFactorSchema } from './schemas/enableTwoFactorSchema';
import { loginWithTwoFactorSchema } from './schemas/loginWithTwoFactorSchema';
import { rateLimiterMiddleware } from '../../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../../middleware/validationMiddleware';

const Admin2FARoutes: Router = Router();

Admin2FARoutes.post(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(emptySchema),
  ],
  Admin2FAController.generateTwoFactorSecret
);

Admin2FARoutes.post(
  '/enable',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(enableTwoFactorSchema),
  ],
  Admin2FAController.enableTwoFactor
);

Admin2FARoutes.delete(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(emptySchema),
  ],
  Admin2FAController.deleteTwoFactor
);

Admin2FARoutes.post(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.LOGIN),
    validationMiddleware(loginWithTwoFactorSchema),
  ],
  Admin2FAController.loginWithTwoFactor
);

export default Admin2FARoutes;
