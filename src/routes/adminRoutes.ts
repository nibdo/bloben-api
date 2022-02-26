import { Router } from 'express';

import AdminRouter from '../api/admin/AdminRoutes';
import AdminUsersRouter from '../api/adminUsers/AdminUsersRoutes';

const AdminRoutes: Router = Router();

AdminRoutes.use('', AdminRouter);
AdminRoutes.use('/users', AdminUsersRouter);

export default AdminRoutes;
