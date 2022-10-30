import * as AdminUsersController from './AdminUsersController';
import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../../app/auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createUserSchema } from './schemas/createUserSchema';
import { deleteUserSchema } from './schemas/deleteUserSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateUserSchema } from './schemas/updateUserSchema';
import { userMiddleware } from '../../../middleware/userMiddleware';

const AdminUsersRoutes: Router = Router();

AdminUsersRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  AdminUsersController.getUsers
);

AdminUsersRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createUserSchema),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  AdminUsersController.adminCreateUser
);

AdminUsersRoutes.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateUserSchema),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  AdminUsersController.adminUpdateUser
);

AdminUsersRoutes.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteUserSchema),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
  ],
  AdminUsersController.adminDeleteUser
);

export default AdminUsersRoutes;
