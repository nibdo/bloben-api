import { NextFunction, Request, Response } from 'express';

import { CommonResponse, PostSharedLinkRequest } from 'bloben-interface';
import { DateTime } from 'luxon';
import { QueryRunner, getConnection } from 'typeorm';
import {
  createArrayQueryReplacement,
  createCommonResponse,
} from '../../../../../utils/common';
import { forEach } from 'lodash';
import { removeCachePublicCalendar } from './deleteSharedCalendar';
import { throwError } from '../../../../../utils/errorCodes';
import CalDavCalendarEntity from '../../../../../data/entity/CalDavCalendar';
import CalDavCalendarRepository from '../../../../../data/repository/CalDavCalendarRepository';
import SharedLinkCalendarEntity from '../../../../../data/entity/SharedLinkCalendars';
import SharedLinkEntity from '../../../../../data/entity/SharedLink';
import SharedLinkRepository from '../../../../../data/repository/SharedLinkRepository';
import WebcalCalendarEntity from '../../../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../../../data/repository/WebcalCalendarRepository';

export const updateSharedCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let connection = await getConnection();
  let queryRunner: QueryRunner | null;

  try {
    const { user, userID } = res.locals;
    const { id } = req.params;
    const body: PostSharedLinkRequest = req.body;

    if (!body.webcalCalendars.length && !body.calDavCalendars.length) {
      throw throwError(404, 'Missing calendars');
    }

    const sharedLinkRaw = await SharedLinkRepository.getSharedLinkByID(
      id,
      userID
    );

    if (!sharedLinkRaw) {
      throw throwError(404, 'Shared link not found');
    }

    let caldavCalendars = [];

    if (body.calDavCalendars.length) {
      caldavCalendars = await CalDavCalendarRepository.getRepository().query(
        `
      SELECT
        c.id
      FROM caldav_calendars c
      INNER JOIN caldav_accounts ca ON c.caldav_account_id = ca.id
      WHERE 
        ca.user_id = $1
        AND c.id IN (${createArrayQueryReplacement(body.calDavCalendars, 2)})
        AND c.deleted_at IS NULL
        AND ca.deleted_at IS NULL
    `,
        [user.id, ...body.calDavCalendars]
      );
    }

    if (caldavCalendars.length !== body.calDavCalendars.length) {
      throw throwError(404, 'CalDAV calendars not found');
    }

    let webcalCalendars = [];

    if (body.webcalCalendars.length) {
      webcalCalendars = await WebcalCalendarRepository.getRepository().query(
        `
      SELECT
        w.id
      FROM webcal_calendars w
      WHERE 
        w.user_id = $1
        AND w.id IN (${createArrayQueryReplacement(body.webcalCalendars, 2)})
        AND w.deleted_at IS NULL
    `,
        [user.id, ...body.webcalCalendars]
      );
    }
    if (webcalCalendars.length !== body.webcalCalendars.length) {
      throw throwError(404, 'Webcal calendars not found');
    }

    connection = await getConnection();
    queryRunner = await connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await queryRunner.manager.update(SharedLinkEntity, id, {
      name: body.name,
      password: body.password,
      expireAt: body.expireAt
        ? DateTime.fromISO(body.expireAt).toJSDate()
        : null,
      settings: body.settings,
    });

    await queryRunner.manager.delete(SharedLinkCalendarEntity, {
      sharedLinkID: id,
    });

    const calendarSharedCalendars: SharedLinkCalendarEntity[] = [];

    forEach(body.calDavCalendars, (item) => {
      const calDavShared = new SharedLinkCalendarEntity(null, id);
      const caldavCalendar = new CalDavCalendarEntity();
      caldavCalendar.id = item;

      calDavShared.calDavCalendar = caldavCalendar;
      calendarSharedCalendars.push(calDavShared);
    });

    forEach(body.webcalCalendars, (item) => {
      const webcalShared = new SharedLinkCalendarEntity(null, id);
      const webcalCalendar = new WebcalCalendarEntity();
      webcalCalendar.id = item;

      webcalShared.webcalCalendar = webcalCalendar;
      calendarSharedCalendars.push(webcalShared);
    });

    await queryRunner.manager.save(calendarSharedCalendars);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    queryRunner = null;

    await removeCachePublicCalendar(id);

    const response: CommonResponse = createCommonResponse(
      'Calendars shared' + ' updated',
      {
        url: '',
      }
    );

    return res.json(response);
  } catch (error) {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    next(error);
  }
};
