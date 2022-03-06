import { Request, Response } from 'express';

import { BULL_QUEUE, LOG_TAG } from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateCalDavCalendarRequest } from '../../../bloben-interface/calDavCalendar/calDavCalendar';
import { DAVNamespaceShort } from 'tsdav';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import { createDavClient } from '../../../service/davService';
import { forEach } from 'lodash';
import { throwError } from '../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import logger from '../../../utils/logger';

export const createCalDavCalendar = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const body: CreateCalDavCalendarRequest = req.body;

  const calDavAccount = await CalDavAccountRepository.getByID(
    body.accountID,
    userID
  );

  if (!calDavAccount) {
    throw throwError(404, 'CalDav account not found');
  }

  const client = createDavClient(calDavAccount.url, {
    username: calDavAccount.username,
    password: calDavAccount.password,
  });

  await client.login();

  const components = {};
  forEach(body.components, (component) => {
    components[`${DAVNamespaceShort.CALDAV}:comp name="${component}"`] = '';
  });

  const result = await client.makeCalendar({
    url: `${calDavAccount.url}/calendars/${calDavAccount.username}/${v4()}`,
    props: {
      [`${DAVNamespaceShort.DAV}:displayname`]: body.name,
      [`${DAVNamespaceShort.CALDAV}:supported-calendar-component-set`]:
        components,
      [`${DAVNamespaceShort.CALDAV_APPLE}:calendar-color`]: body.color,
    },
  });

  if (!result?.[0].ok) {
    logger.error('Create caldav calendar error', result?.[0], [LOG_TAG.CALDAV]);
    throw throwError(409, 'Cannot create caldav calendar');
  }

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('CalDav calendar created');
};
