import { Request, Response } from 'express';

import { GetCaldavEventResponse } from 'bloben-interface';
import { createEventFromCalendarObject } from '../../../../utils/davHelper';
import { fetchCalendarObjects } from 'tsdav';
import { getDavRequestData } from '../../../../utils/davAccountHelper';
import { throwError } from '../../../../utils/errorCodes';
import CalDavAccountRepository from '../../../../data/repository/CalDavAccountRepository';

interface Query {
  url: string;
  calendarID: string;
}

export const getCalDavEvent = async (
  req: Request,
  res: Response
): Promise<GetCaldavEventResponse> => {
  const { userID } = res.locals;
  const { url, calendarID } = req.query as unknown as Query;

  // get account with calendar
  const calDavAccount = await CalDavAccountRepository.getByUserIDAndCalendarID(
    userID,
    calendarID
  );

  if (!calDavAccount) {
    throw throwError(404, 'Account not found');
  }

  const davRequestData = getDavRequestData(calDavAccount);
  const { davHeaders } = davRequestData;

  const fetchedEvents = await fetchCalendarObjects({
    headers: davHeaders,
    calendar: calDavAccount.calendar,
    objectUrls: [url],
    // expand: true,
  });

  const eventTemp = createEventFromCalendarObject(
    fetchedEvents[0],
    calDavAccount.calendar
  );

  return {
    startAt: eventTemp.startAt,
    endAt: eventTemp.endAt,
    timezoneStart: eventTemp.timezone,
    rRule: eventTemp.rRule,
  };
};
