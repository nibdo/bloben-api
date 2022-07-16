import { DateTime } from 'luxon';
import { NextFunction, Request, Response } from 'express';
import { throwError } from '../utils/errorCodes';
import SharedLinkRepository from '../data/repository/SharedLinkRepository';

export const publicLinkMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw throwError(404, 'Calendar not found', req);
    }

    const sharedLinkRaw = await SharedLinkRepository.getRepository().query(
      `
    SELECT
      s.id as id, 
      s.expire_at as "expireAt",
      s.is_enabled as "isEnabled"
    FROM
        shared_links s
    INNER JOIN shared_link_calendars slc ON slc.shared_link_id = s.id
    WHERE
        s.id = $1
        AND s.deleted_at IS NULL
  `,
      [id]
    );

    if (!sharedLinkRaw.length) {
      throw throwError(404, 'Calendar not found', req);
    }

    const sharedLink = sharedLinkRaw[0];

    if (!sharedLink.isEnabled) {
      throw throwError(404, 'Calendar not found', req);
    }

    if (
      sharedLink.expireAt &&
      DateTime.fromJSDate(sharedLink.expireAt).valueOf() <=
        DateTime.now().valueOf()
    ) {
      throw throwError(404, 'Calendar not found', req);
    }

    res.locals.sharedLink = sharedLink;

    return next();
  } catch (e) {
    next(e);
  }
};
