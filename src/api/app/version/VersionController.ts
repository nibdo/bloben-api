import { NextFunction, Request, Response } from 'express';

import { GetVersion } from '../../../bloben-interface/version/version';
import { getVersion } from './handlers/getVersion';

export const getVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: GetVersion = await getVersion();

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
