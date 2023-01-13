import { Request, Response } from 'express';
import { getRangeEventsFunc } from '../helpers/getInRangeHelper';

interface Query {
  rangeFrom: string;
  rangeTo: string;
  isDark: boolean;
  showTasks: boolean;
}

/**
 * Get events outside base range
 * @param req
 * @param res
 */
export const getEventsInRange = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  const { userID } = res.locals;
  const { rangeFrom, rangeTo, isDark, showTasks } =
    req.query as unknown as Query;

  return await getRangeEventsFunc(
    userID,
    rangeFrom,
    rangeTo,
    showTasks,
    isDark
  );
};
