import { NextFunction, Request, Response } from 'express';

import { CommonResponse, PostSharedLinkRequest } from 'bloben-interface';
import { QueryRunner, getConnection } from 'typeorm';
import {
  createArrayQueryReplacement,
  createCommonResponse,
} from '../../../../../utils/common';
import { forEach } from 'lodash';
import { throwError } from '../../../../../utils/errorCodes';
import CalDavCalendarEntity from '../../../../../data/entity/CalDavCalendar';
import CalDavCalendarRepository from '../../../../../data/repository/CalDavCalendarRepository';
import SharedLinkCalendarEntity from '../../../../../data/entity/SharedLinkCalendars';
import SharedLinkEntity from '../../../../../data/entity/SharedLink';
import WebcalCalendarEntity from '../../../../../data/entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../../../../../data/repository/WebcalCalendarRepository';

export const createSharedCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let connection = await getConnection();
  let queryRunner: QueryRunner | null;

  try {
    const { user } = res.locals;
    const body: PostSharedLinkRequest = req.body;

    if (!body.webcalCalendars.length && !body.calDavCalendars.length) {
      throw throwError(404, 'Missing calendars');
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

    const calendarShared = new SharedLinkEntity(body, user);
    await queryRunner.manager.save(calendarShared);

    const calendarSharedCalendars: SharedLinkCalendarEntity[] = [];

    forEach(body.calDavCalendars, (item) => {
      const calDavShared = new SharedLinkCalendarEntity(calendarShared);
      const caldavCalendar = new CalDavCalendarEntity();
      caldavCalendar.id = item;

      calDavShared.calDavCalendar = caldavCalendar;
      calendarSharedCalendars.push(calDavShared);
    });

    forEach(body.webcalCalendars, (item) => {
      const webcalShared = new SharedLinkCalendarEntity(calendarShared);
      const webcalCalendar = new WebcalCalendarEntity();
      webcalCalendar.id = item;

      webcalShared.webcalCalendar = webcalCalendar;
      calendarSharedCalendars.push(webcalShared);
    });

    await queryRunner.manager.save(calendarSharedCalendars);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    const response: CommonResponse = createCommonResponse('Calendars shared', {
      url: '',
    });

    return res.json(response);
  } catch (error) {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    next(error);
  }
};
