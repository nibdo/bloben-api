import { NextFunction, Request, Response } from 'express';

import { CommonResponse } from '../../bloben-interface/interface';
import PushSubscriptionService from './PushSubscriptionService';

export const createPushSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: CommonResponse =
      await PushSubscriptionService.createPushSubscription(req, res);

    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
