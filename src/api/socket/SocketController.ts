import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../bloben-interface/interface';
import SocketService from './SocketService';

export const createSocketSessionId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse = await SocketService.createSocketSessionId(
      req,
      res
    );

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
