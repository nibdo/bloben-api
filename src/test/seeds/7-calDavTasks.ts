import { Connection, MigrationInterface, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { testUserData } from './1-user-seed';
import UserEntity from '../../data/entity/UserEntity';
import { CreateCalDavEventRequest } from '../../bloben-interface/event/event';
import CalDavCalendarEntity from '../../data/entity/CalDavCalendar';
import CalDavEventEntity from '../../data/entity/CalDavEventEntity';
import ICalParser, {EventJSON, TodoJSON} from 'ical-js-parser-commonjs';
import { formatEventJsonToCalDavEvent } from '../../utils/davHelper';
import { DAVCalendarObject } from 'tsdav';
import { v4 } from 'uuid';
import CalDavTaskEntity from "../../data/entity/CalDavTaskEntity";
import {formatTodoJsonToCalDavTodo} from "../../utils/davHelperTodo";

export const createDummyCalDavTask = (
    calendarID: string
): CreateCalDavEventRequest => {
    const externalID = v4();
    return {
        externalID,
        calendarID,
        iCalString: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:Bloben
CALSCALE:GREGORIAN
BEGIN:VTODO
DTSTAMP:20220306T220252Z
LAST-MODIFIED:20220306T220252Z
UID:${externalID}
SEQUENCE:0
SUMMARY:afajoajsfio
DESCRIPTION:
STATUS:NEEDS-ACTION
CREATED:20220306T214034Z
END:VTODO
END:VCALENDAR`,
    };
};

export const testTodoIcalString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:Bloben
CALSCALE:GREGORIAN
BEGIN:VTODO
DTSTAMP:20220306T220252Z
LAST-MODIFIED:20220306T220252Z
UID:13564198196981
SEQUENCE:0
SUMMARY:afajoajsfio
DESCRIPTION:
STATUS:NEEDS-ACTION
CREATED:20220306T214034Z
END:VTODO
END:VCALENDAR`;

export const testTodosData: CreateCalDavEventRequest[] = [
    {
        externalID: '7becdebb-81d1-45b6-b8db-4a50f06b2a2c',
        calendarID: '',
        iCalString: testTodoIcalString,
    },
    {
        externalID: 'ca5be5b5-c73f-4040-b909-e4a73a716671',
        calendarID: '',
        iCalString: testTodoIcalString,
    },
];

export class calDavTasks implements MigrationInterface {
    public async up(): Promise<{ task: CalDavTaskEntity }> {
        // @ts-ignore
        const connection: Connection = await getConnection();

        const [user, calendar] = await Promise.all([
            connection.manager.findOne(UserEntity, {
                where: {
                    username: testUserData.username,
                },
            }),
            connection.manager.findOne(CalDavCalendarEntity, {
                where: {
                    url: `http://${testUserData.username}`,
                },
            }),
        ]);

        const todos: CalDavTaskEntity[] = [];

        forEach(testTodosData, (todo) => {
            const icalJS = ICalParser.toJSON(todo.iCalString);
            const todoJSON: TodoJSON = icalJS.todos[0];
            const todoObj = formatTodoJsonToCalDavTodo(
                todoJSON,
                {
                    data: '',
                    etag: '123',
                    url: `http://${testUserData.username}`,
                } as DAVCalendarObject,
                calendar
            );

            todos.push(new CalDavTaskEntity(todoObj));
        });

        await connection.manager.save(todos);

        return { task: todos[0] };
    }

    public async down(): Promise<void> {
        return Promise.resolve();
    }
}
