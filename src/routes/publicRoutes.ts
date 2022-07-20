import { Router } from 'express';

import PublicCalendarRouter from '../api/publicCalendar/publicCalendarRouter';

const PublicRouter: Router = Router();

PublicRouter.use(`/calendars`, PublicCalendarRouter);

export default PublicRouter;
