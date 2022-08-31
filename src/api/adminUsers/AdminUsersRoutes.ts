import * as AdminUsersController from './AdminUsersController';
import { RATE_LIMIT } from '../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createUserSchema } from './schemas/createUserSchema';
import { deleteUserSchema } from './schemas/deleteUserSchema';
import { emptySchema } from '../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { updateUserSchema } from './schemas/updateUserSchema';
import { userMiddleware } from '../../middleware/userMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const AdminUsersRoutes: Router = Router();

AdminUsersRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(emptySchema),
  ],
  AdminUsersController.getUsers
);

AdminUsersRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(createUserSchema),
  ],
  AdminUsersController.adminCreateUser
);

AdminUsersRoutes.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(updateUserSchema),
  ],
  AdminUsersController.adminUpdateUser
);

AdminUsersRoutes.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    validationMiddleware(deleteUserSchema),
  ],
  AdminUsersController.adminDeleteUser
);

export default AdminUsersRoutes;
