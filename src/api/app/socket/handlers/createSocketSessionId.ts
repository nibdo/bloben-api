import { Request, Response } from 'express';

import { CommonResponse, CreateSocketSessionRequest } from 'bloben-interface';
import { MemoryClient } from '../../../../service/init';
import { REDIS_PREFIX } from '../../../../utils/enums';
import { SocketSession } from '../../../../common/interface/common';
import { createCommonResponse } from '../../../../utils/common';

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

  await MemoryClient.set(redisKey, JSON.stringify(userData));

  return createCommonResponse();
};
