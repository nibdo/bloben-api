import { Request, Response } from 'express';

import { CALDAV_COMPONENTS } from '../../../../data/types/enums';
import {
  CommonResponse,
  UpdateCalDavTaskSettingsRequest,
} from 'bloben-interface';
import {
  SOCKET_CHANNEL,
  SOCKET_MSG_TYPE,
  SOCKET_ROOM_NAMESPACE,
} from '../../../../utils/enums';
import { createCommonResponse } from '../../../../utils/common';
import { io } from '../../../../app';
import { throwError } from '../../../../utils/errorCodes';
import CalDavCalendarEntity from '../../../../data/entity/CalDavCalendar';
import CalDavCalendarRepository from '../../../../data/repository/CalDavCalendarRepository';
import CalDavTaskSettingsEntity from '../../../../data/entity/CalDavTaskSettings';
import CalDavTaskSettingsRepository from '../../../../data/repository/CalDavTaskSettingsRepository';

export const updateCalDavTaskSettings = async (
  req: Request,
  res: Response
): Promise<CommonResponse> => {
  const { userID } = res.locals;
  const { calendarID } = req.params;
  const body: UpdateCalDavTaskSettingsRequest = req.body;

  // get calendar
  const calendar = await CalDavCalendarRepository.getByIDAndComponent(
    calendarID,
    userID,
    CALDAV_COMPONENTS.VTODO
  );

  if (!calendar) {
    throw throwError(404, 'Calendar not found');
  }

  const settings = await CalDavTaskSettingsRepository.getByCalendarID(
    calendarID,
    userID
  );

  // create new
  if (!settings) {
    const calendarEntity = new CalDavCalendarEntity();
    calendarEntity.id = calendarID;

    const newSettings = new CalDavTaskSettingsEntity();
    newSettings.calendar = calendarEntity;
    newSettings.order = body.order;
    newSettings.orderBy = body.orderBy;

    await CalDavTaskSettingsRepository.getRepository().save(newSettings);
  } else {
    await CalDavTaskSettingsRepository.getRepository().update(
      {
        id: settings.id,
      },
      {
        order: body.order,
        orderBy: body.orderBy,
      }
    );
  }

  io.to(`${SOCKET_ROOM_NAMESPACE.USER_ID}${userID}`).emit(
    SOCKET_CHANNEL.SYNC,
    JSON.stringify({ type: SOCKET_MSG_TYPE.CALDAV_TASK_SETTINGS })
  );

  return createCommonResponse('Task settings updated');
};
