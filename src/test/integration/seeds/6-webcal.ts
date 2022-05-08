import {
    Connection,
    MigrationInterface,
    QueryRunner,
    getConnection,
} from 'typeorm';

import UserEntity from '../../../data/entity/UserEntity';
import WebcalCalendarEntity from '../../../data/entity/WebcalCalendarEntity';
import WebcalEventEntity from '../../../data/entity/WebcalEventEntity';
import { testUserData } from './1-user-seed';
import { CreateWebcalCalendarRequest } from '../../../bloben-interface/webcalCalendar/webcalCalendar';

export const webcalTestData: CreateWebcalCalendarRequest = {
    name: 'Test cal',
    color: 'indigo',
    url: 'http://localhost:3000',
    syncFrequency: 180,
    alarms: []
};

export const createWebcalCalendars = async () => {
    const connection: Connection = await getConnection();

    const user: UserEntity | undefined = await connection.manager.findOne(
        UserEntity,
        {
            where: {
                username: testUserData.username,
            },
        }
    );

    const webcalCalendar: WebcalCalendarEntity = new WebcalCalendarEntity(
        webcalTestData,
        user
    );

    await connection.manager.save(webcalCalendar);

    const webcalEvent: WebcalEventEntity = new WebcalEventEntity().setData(
        {
            begin: 'VEVENT',
            end: 'VEVENT',
            summary: 'Test',
            description: '',
            location: '',
            sequence: '1',
            dtstart: { value: '2021-11-07T18:40:00.000Z' },
            dtend: { value: '2021-11-07T22:00:00.000Z' },
            rrule: null,
            lastModified: { value: '2021-11-07T16:30:00.000Z' },
            uid: 'asfaf',
        },
        'Europe/Berlin'
    );

    await connection.manager.save(webcalEvent);

    return webcalCalendar;
};

export class webcal implements MigrationInterface {
    public async up(): Promise<void> {
        await createWebcalCalendars();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
