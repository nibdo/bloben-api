import { getLogDates } from './handlers/getLogDates';
import { getLogTags } from './handlers/getLogTags';
import { getLogs } from './handlers/getLogs';

const LogService = {
  getLogs,
  getLogTags,
  getLogDates,
};

export default LogService;
