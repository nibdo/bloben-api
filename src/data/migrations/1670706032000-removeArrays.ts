import {
  Connection,
  MigrationInterface,
  QueryRunner,
  TableColumn,
  getConnection,
} from 'typeorm';
import { LOG_TAG } from '../../utils/enums';
import { forEach } from 'lodash';
import { parseJSON } from '../../utils/common';
import CalDavCalendarEntity from '../entity/CalDavCalendar';
import CalDavCalendarRepository from '../repository/CalDavCalendarRepository';
import CalDavEventEntity from '../entity/CalDavEventEntity';
import CalDavEventRepository from '../repository/CalDavEventRepository';
import CardDavContact from '../entity/CardDavContact';
import CardDavContactRepository from '../repository/CardDavContactRepository';
import UserEmailConfigEntity from '../entity/UserEmailConfig';
import UserEmailConfigRepository from '../repository/UserEmailConfigRepository';
import WebcalCalendarEntity from '../entity/WebcalCalendarEntity';
import WebcalCalendarRepository from '../repository/WebcalCalendarRepository';
import WebcalEventEntity from '../entity/WebcalEventEntity';
import WebcalEventRepository from '../repository/WebcalEventRepository';
import logger from '../../utils/logger';

const createColumn = (name: string, type = 'text') => {
  return new TableColumn({
    isArray: false,
    isGenerated: false,
    isNullable: true,
    isPrimary: false,
    isUnique: false,
    length: '',
    unsigned: false,
    zerofill: false,
    type,
    name,
  });
};

export class RemoveArrays1670706032000 implements MigrationInterface {
  public async up(): Promise<void> {
    let connection: Connection | null;
    let queryRunner: QueryRunner | null;

    try {
      const calendarColumns = ['components', 'alarms'];
      const calendars: {
        id: string;
        components: string[];
        alarms: any[];
      }[] = await CalDavCalendarRepository.getRepository().query(`
        SELECT 
          id,
          components,
          alarms
        FROM caldav_calendars
      `);

      const eventColumns = [
        'exdates',
        'attendees',
        'organizer',
        'recurrence_id',
        'valarms',
        'props',
      ];
      const events: {
        id: string;
        exdates: any[];
        attendees: any[];
        organizer: any[];
        recurrenceID: any[];
        valarms: any[];
        props: any[];
      }[] = await CalDavEventRepository.getRepository().query(`
        SELECT 
          id,
          exdates,
          attendees,
          organizer,
          recurrence_id as "recurrenceID",
          valarms,
          props
        FROM caldav_events
      `);

      const contactColumns = ['emails'];
      const contacts: {
        id: string;
        emails: string[];
      }[] = await CardDavContactRepository.getRepository().query(`
        SELECT 
          id,
          emails
        FROM carddav_contacts
      `);

      const emailConfigColumns = ['aliases'];
      const emailConfigs: {
        id: string;
        aliases: string[];
      }[] = await UserEmailConfigRepository.getRepository().query(`
        SELECT 
          id,
          aliases
        FROM user_email_config
      `);

      const webcalCalendarColumns = ['alarms'];
      const webcalCalendars: {
        id: string;
        alarms: any[];
      }[] = await WebcalCalendarRepository.getRepository().query(`
        SELECT 
          id,
          alarms
        FROM webcal_calendars
      `);

      const webcalEventColumns = ['exceptions', 'attendees', 'organizer'];
      const webcalEvents: {
        id: string;
        exceptions: any[];
        attendees: any[];
        organizer: any[];
      }[] = await WebcalEventRepository.getRepository().query(`
        SELECT 
          id,
          exceptions,
          attendees,
          organizer
        FROM webcal_events
      `);

      connection = await getConnection();
      queryRunner = await connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const promises: any = [];

      for (const item of calendarColumns) {
        await queryRunner.changeColumn(
          'caldav_calendars',
          item,
          createColumn(item)
        );
      }

      for (const item of eventColumns) {
        await queryRunner.changeColumn(
          'caldav_events',
          item,
          createColumn(item)
        );
      }

      for (const item of contactColumns) {
        await queryRunner.changeColumn(
          'carddav_contacts',
          item,
          createColumn(item)
        );
      }

      for (const item of emailConfigColumns) {
        await queryRunner.changeColumn(
          'user_email_config',
          item,
          createColumn(item)
        );
      }

      for (const item of webcalCalendarColumns) {
        await queryRunner.changeColumn(
          'webcal_calendars',
          item,
          createColumn(item)
        );
      }

      for (const item of webcalEventColumns) {
        await queryRunner.changeColumn(
          'webcal_events',
          item,
          createColumn(item)
        );
      }

      forEach(calendars, (calendar) => {
        const components = parseJSON(calendar.components);
        const alarms = parseJSON(calendar.alarms);

        promises.push(
          queryRunner.manager
            .getRepository(CalDavCalendarEntity)
            .update(calendar.id, {
              components,
              alarms,
            })
        );
      });

      forEach(events, (item) => {
        const exdates = parseJSON(item.exdates);
        const attendees = parseJSON(item.attendees);
        const organizer = parseJSON(item.organizer);
        const recurrenceID = parseJSON(item.recurrenceID);
        const valarms = parseJSON(item.valarms);
        const props = parseJSON(item.props);

        promises.push(
          queryRunner.manager.getRepository(CalDavEventEntity).update(item.id, {
            exdates,
            attendees,
            organizer,
            recurrenceID,
            valarms,
            props,
          })
        );
      });

      forEach(contacts, (item) => {
        const emails = parseJSON(item.emails);

        promises.push(
          queryRunner.manager.getRepository(CardDavContact).update(item.id, {
            emails,
          })
        );
      });

      forEach(emailConfigs, (item) => {
        const aliases = parseJSON(item.aliases);

        promises.push(
          queryRunner.manager
            .getRepository(UserEmailConfigEntity)
            .update(item.id, {
              aliases,
            })
        );
      });

      forEach(webcalCalendars, (item) => {
        const alarms = parseJSON(item.alarms);

        promises.push(
          queryRunner.manager
            .getRepository(WebcalCalendarEntity)
            .update(item.id, {
              alarms,
            })
        );
      });

      forEach(webcalEvents, (item) => {
        const exceptions = parseJSON(item.exceptions);
        const attendees = parseJSON(item.attendees);
        const organizer = parseJSON(item.organizer);

        promises.push(
          queryRunner.manager.getRepository(WebcalEventEntity).update(item.id, {
            exceptions,
            attendees,
            organizer,
          })
        );
      });

      await Promise.all(promises);

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      logger.error('Migration RemoveArrays1670706032000 error', e, [
        LOG_TAG.UNKNOWN,
      ]);
      if (queryRunner) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }

      throw Error('Migration RemoveArrays1670706032000 error');
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
