import { NextFunction, Request, Response } from 'express';

import { GetSharedCalendarsResponse } from '../../../../../bloben-interface/calendar/shared/calendarShared';
import SharedLinkRepository from '../../../../../data/repository/SharedLinkRepository';

export const getSharedCalendars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = res.locals;

    const sharedLinksRaw: { id: string; name: string; isEnabled: boolean }[] =
      await SharedLinkRepository.getRepository().query(
        `
    SELECT
      s.id as id, 
      s.name as name,
      s.is_enabled as "isEnabled"
    FROM
        shared_links s
    WHERE
        s.user_id = $1
        AND s.deleted_at IS NULL
    ORDER BY
        s.created_at DESC
  `,
        [userID]
      );

    const response: GetSharedCalendarsResponse[] = sharedLinksRaw;

    return res.json(response);
  } catch (error) {
    next(error);
  }
};
