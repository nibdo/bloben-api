import { NextFunction, Request, Response } from 'express';

import { GetSharedLinkPublicResponse } from 'bloben-interface';
import { MemoryClient } from '../../../../service/init';
import { REDIS_PREFIX } from '../../../../utils/enums';
import SharedLinkRepository from '../../../../data/repository/SharedLinkRepository';

export const getPublicSharedLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sharedLink } = res.locals;

    const cacheResponse = await MemoryClient.get(
      `${REDIS_PREFIX.PUBLIC_SHARED_LINK}_${sharedLink.id}`
    );

    if (cacheResponse) {
      return res.json(JSON.parse(cacheResponse));
    }

    const sharedLinkRaw: { id: string; settings: any }[] =
      await SharedLinkRepository.getRepository().query(
        `
    SELECT
      s.id as id, 
      s.settings as settings
    FROM
        shared_links s
    WHERE
        s.id = $1
        AND s.deleted_at IS NULL
  `,
        [sharedLink.id]
      );

    const result = sharedLinkRaw[0];

    const response: GetSharedLinkPublicResponse = {
      id: result.id,
      settings: result.settings,
    };

    await MemoryClient.set(
      `${REDIS_PREFIX.PUBLIC_SHARED_LINK}_${sharedLink.id}`,
      JSON.stringify(response),
      'EX',
      60 * 6
    );

    return res.json(response);
  } catch (err) {
    next(err);
  }
};
