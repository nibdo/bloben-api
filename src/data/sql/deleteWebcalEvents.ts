export const deleteWebcalEventsExceptionsSql = `
    DELETE FROM webcal_event_exceptions WHERE webcal_event_exceptions.webcal_calendar_id = $1;
`;

export const deleteWebcalEventsSql = `
    DELETE FROM webcal_events WHERE external_calendar_id = $1;
`;
