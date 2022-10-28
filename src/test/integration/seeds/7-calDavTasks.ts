import { Connection, getConnection } from 'typeorm';
import { forEach } from 'lodash';

import { CreateCalDavEventRequest } from 'bloben-interface';
import { DAVCalendarObject } from 'tsdav';
import { formatTodoJsonToCalDavTodo } from '../../../utils/davHelper';
import { seedCalDavCalendars } from './3-calDavCalendars';
import { v4 } from 'uuid';
import CalDavEventEntity from '../../../data/entity/CalDavEventEntity';
import ICalParser, { TodoJSON } from 'ical-js-parser';
import UserEntity from '../../../data/entity/UserEntity';

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

export const seedTasks = async (
  userID: string
): Promise<{ task: CalDavEventEntity }> => {
  // @ts-ignore
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const { calDavCalendar } = await seedCalDavCalendars(userID);

  const todos: CalDavEventEntity[] = [];

  forEach(testTodosData, (todo) => {
    const icalJS = ICalParser.toJSON(todo.iCalString);
    const todoJSON: TodoJSON = icalJS.todos[0];
    const todoObj = formatTodoJsonToCalDavTodo(
      todoJSON,
      {
        data: '',
        etag: '123',
        url: `http://${user.username}`,
      } as DAVCalendarObject,
      calDavCalendar
    );

    todos.push(new CalDavEventEntity(todoObj));
  });

  await connection.manager.save(todos);

  return { task: todos[0] };
};
