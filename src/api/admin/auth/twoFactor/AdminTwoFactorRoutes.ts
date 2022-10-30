import * as Admin2FAController from './AdminTwoFactorController';
import { RATE_LIMIT } from '../../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../../../app/auth/UserEnums';
import { authMiddleware } from '../../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../../common/schemas/emptySchema';
import { enableTwoFactorSchema } from './schemas/enableTwoFactorSchema';
import { loginWithTwoFactorSchema } from './schemas/loginWithTwoFactorSchema';
import { rateLimiterMiddleware } from '../../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../../middleware/roleMiddleware';

const AdminTwoFactorRoutes: Router = Router();

AdminTwoFactorRoutes.post(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  Admin2FAController.generateTwoFactorSecret
);

AdminTwoFactorRoutes.post(
  '/enable',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(enableTwoFactorSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  Admin2FAController.enableTwoFactor
);

AdminTwoFactorRoutes.delete(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  Admin2FAController.deleteTwoFactor
);

AdminTwoFactorRoutes.post(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.ADMIN_LOGIN),
    celebrate(loginWithTwoFactorSchema),
  ],
  Admin2FAController.loginWithTwoFactor
);

export default AdminTwoFactorRoutes;
