import {
  BULL_QUEUE,
  LOG_TAG,
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../utils/enums';
import { CommonResponse } from '../../../bloben-interface/interface';
import { CreateCalDavCalendarRequest } from '../../../bloben-interface/calDavCalendar/calDavCalendar';
import { DAVNamespaceShort } from 'tsdav';
import { Request, Response } from 'express';
import { calDavSyncBullQueue } from '../../../service/BullQueue';
import { createCommonResponse } from '../../../utils/common';
import { createDavClient } from '../../../service/davService';
import { fetch } from 'cross-fetch';
import { forEach } from 'lodash';
import { io } from '../../../app';
import { throwError } from '../../../utils/errorCodes';
import { v4 } from 'uuid';
import CalDavAccountRepository from '../../../data/repository/CalDavAccountRepository';
import logger from '../../../utils/logger';

const fallbackToMKCOL = async (
  body: CreateCalDavCalendarRequest,
  username: string,
  password: string,
  url: string,
  id: string
) => {
  let urlParsed = url;

  const hasHttps = urlParsed.includes('https://');
  if (hasHttps) {
    urlParsed = urlParsed.slice('https://'.length);
  }

  return fetch(
    `${
      hasHttps ? 'https://' : ''
    }${username}:${password}@${urlParsed}/${username}/${id}/`,
    {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
      },
      method: 'MKCOL',
      body: `<?xml version="1.0" encoding="UTF-8" ?><mkcol xmlns="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:A="http://apple.com/ns/ical/" xmlns:D="urn:ietf:params:xml:ns:carddav"><set><prop><resourcetype><collection /><C:calendar /></resourcetype><C:supported-calendar-component-set>${body.components.map(
        (item) => `<C:comp name="${item}" />`
      )}</C:supported-calendar-component-set><displayname>${
        body.name
      }</displayname><A:calendar-color>${
        body.color
      }</A:calendar-color></prop></set></mkcol>`,
    }
  );
};

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

  const remoteID = v4();
  const result = await client.makeCalendar({
    url: `${calDavAccount.url}/calendars/${calDavAccount.username}/${remoteID}`,
    props: {
      [`${DAVNamespaceShort.DAV}:displayname`]: body.name,
      [`${DAVNamespaceShort.CALDAV}:supported-calendar-component-set`]:
        components,
      [`${DAVNamespaceShort.CALDAV_APPLE}:calendar-color`]: body.color,
    },
  });

  if (!result?.[0].ok) {
    try {
      // try fallback to make collection
      const fallbackResponse = await fallbackToMKCOL(
        body,
        calDavAccount.username,
        calDavAccount.password,
        calDavAccount.url,
        remoteID
      );

      if (fallbackResponse.status >= 300) {
        logger.error('Create caldav calendar error', result?.[0], [
          LOG_TAG.CALDAV,
        ]);
        throw throwError(409, 'Cannot create caldav calendar');
      }
    } catch (fallbackError: any) {
      logger.error('Create caldav calendar error', result?.[0], [
        LOG_TAG.CALDAV,
      ]);
      throw throwError(409, 'Cannot create caldav calendar');
    }
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_CALENDARS })
  );

  await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, { userID });

  return createCommonResponse('CalDav calendar created', { remoteID });
};
