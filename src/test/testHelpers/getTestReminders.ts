import { formatSQLDateTime } from '../../data/repository/CalDavEventRepository';
import { getConnection } from 'typeorm';

export const getTestReminders = async (externalID: string) => {
  const connection = await getConnection();

  const result = await connection.query(
    `
      SELECT 
        r.id as id, 
        ${formatSQLDateTime('r.send_at')} as "sendAt"
      FROM 
        reminders r
      INNER JOIN caldav_event_alarms ca ON ca.id = r.caldav_event_alarm_id
      INNER JOIN caldav_events e ON e.id = ca.event_id
    WHERE
        e.external_id = $1  
    ORDER BY r.send_at ASC
    `,
    [externalID]
  );

  return result;
};
