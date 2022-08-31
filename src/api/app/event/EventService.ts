import { getCachedEvents } from './handlers/getCachedEvents';
import { getEvent } from './handlers/getEvent';
import { getEventsInRange } from './handlers/getEventsInRange';
import { searchEvents } from './handlers/searchEvents';

const EventService = {
  getCachedEvents,
  getEventsInRange,
  searchEvents,
  getEvent,
};

export default EventService;
