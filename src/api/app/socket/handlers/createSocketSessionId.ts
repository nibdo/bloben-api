import { Request, Response } from 'express';

import { CommonResponse } from '../../../../bloben-interface/interface';
import { CreateSocketSessionRequest } from '../../../../bloben-interface/socket/socket';
import { REDIS_PREFIX } from '../../../../utils/enums';
import { SocketSession } from '../../../../common/interface/common';
import { createCommonResponse } from '../../../../utils/common';
import { redisClient } from '../../../../index';

/**
 * Matching record in Redis to pair socketSessionId with client with server session id
 * @param req
 */
export const createSocketSessionId = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const body: CreateSocketSessionRequest = req.body;
  const { clientSessionId } = body;
  const { userID } = res.locals;

  const redisKey = `${REDIS_PREFIX.SOCKET}_${clientSessionId}`;

  // store socketSessionId from client in Redis with server session id
  const userData: SocketSession | any = {
    userID,
    createdAt: new Date().toISOString(),
  };

  await redisClient.set(redisKey, JSON.stringify(userData));

  return createCommonResponse();
};
