import { Request, Response } from 'express';
import { forEach, groupBy } from 'lodash';

import { DateTime } from 'luxon';
import {
  SOCKET_APP_TYPE,
  SOCKET_CRUD_ACTION,
} from '../../../bloben-interface/enums';
import { SOCKET_CHANNEL, SOCKET_ROOM_NAMESPACE } from '../../../utils/enums';
import { SyncResponse } from '../../../common/interface/common';
import { addRepeatedEvents } from '../../../utils/eventRepeatHelper';
import {
  createSocketCrudMsg,
  getCurrentRangeForSync,
} from '../../../utils/common';
import { io } from '../../../app';
import CalDavEventRepository from '../../../data/repository/CalDavEventRepository';

export const syncCalDavEvents = async (
  req: Request,
  res: Response
): Promise<SyncResponse> => {
  const { userID } = res.locals;
  const { syncDate } = req.query;

  const syncedAt = DateTime.now().toUTC().toString();

  let resultCalDavEvents =
    await CalDavEventRepository.getCalDavEventsByIDForSync(
      userID,
      syncDate as string
    );

  resultCalDavEvents = addRepeatedEvents(
    resultCalDavEvents,
    getCurrentRangeForSync()
  );

  let eventsToUpdate: any = [];

  forEach(resultCalDavEvents, (event) => {
    eventsToUpdate.push(event);
  });

  // group by id
  eventsToUpdate = groupBy(eventsToUpdate, 'id');

  forEach(eventsToUpdate, (items: any, key: string) => {
    io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
      SOCKET_CHANNEL.SYNC,
      createSocketCrudMsg(
        key,
        new Date().toISOString(),
        SOCKET_CRUD_ACTION.UPDATE,
        SOCKET_APP_TYPE.EVENT,
        null,
        items
      )
    );
  });

  return {
    syncedAt,
    data: [],
  };
};
