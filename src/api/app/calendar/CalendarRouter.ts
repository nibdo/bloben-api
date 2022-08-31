import { Router } from 'express';
import CalendarSharedRouter from './shared/CalendarSharedRouter';

const CalendarRoutes: Router = Router();

CalendarRoutes.use(`/shared`, CalendarSharedRouter);

export default CalendarRoutes;
