import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { getSync } from './handlers/getSync';

export const getSyncController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await getSync(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
