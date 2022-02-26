import { Request, Response } from 'express';

import { CommonResponse } from '../../../bloben-interface/interface';
import { CreatePushSubscriptionRequest } from '../PushSubscriptionInterface';
import { createCommonResponse } from '../../../utils/common';
import PushSubscriptionEntity from '../../../data/entity/PushSubscriptionEntity';
import PushSubscriptionRepository from '../../../data/repository/PushSubscriptionRepository';

export const createPushSubscription = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: CreatePushSubscriptionRequest = req.body;
  const { user } = res.locals;

  const existingPushSubscription: PushSubscriptionEntity | undefined =
    await PushSubscriptionRepository.getRepository()
      .createQueryBuilder('p')
      .leftJoin('p.user', 'u')
      .where('p.auth = :auth', { auth: body.subscription.keys.auth })
      .andWhere('p.p256dh = :p256dh', { p256dh: body.subscription.keys.p256dh })
      .andWhere('p.endpoint = :endpoint', {
        endpoint: body.subscription.endpoint,
      })
      .andWhere('u.id = :userID', { userID: user.id })
      .getOne();

  if (!existingPushSubscription) {
    const pushSubscription: PushSubscriptionEntity = new PushSubscriptionEntity(
      body,
      user
    );

    await PushSubscriptionRepository.create(pushSubscription);
  }

  return createCommonResponse();
};
