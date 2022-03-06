import { Router } from 'express';

import AdminRouter from '../api/admin/AdminRoutes';
import AdminUsersRouter from '../api/adminUsers/AdminUsersRoutes';
import LogRouter from '../api/log/LogRoutes';

const AdminRoutes: Router = Router();

AdminRoutes.use('', AdminRouter);
AdminRoutes.use('/users', AdminUsersRouter);
AdminRoutes.use(`/logs`, LogRouter);

export default AdminRoutes;
