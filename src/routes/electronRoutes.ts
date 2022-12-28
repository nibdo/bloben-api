import { Router } from 'express';
import ElectronUserRouter from '../api/electron/electronUser/electronUserRouter';

const ElectronRouter: Router = Router();

ElectronRouter.use(`/users`, ElectronUserRouter);

export default ElectronRouter;
