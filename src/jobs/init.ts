import { clearLogs } from './clearLogs';
import { syncCalDavCronJob } from './cronJobs/syncCalDavCronJob';
import { syncCalDavCronJobConnectedUsers } from './cronJobs/syncCalDavCronJobConnectedUsers';

import { CronJob } from 'cron';

export const initCronJobs = () => {
  // clean logs
  const clearLogsJob = new CronJob('0 1 * * *', clearLogs);
  clearLogsJob.start();

  // const webcalJob = new CronJob('*/60 * * * *', syncWebcalEventsQueueJob());
  // webcalJob.start();

  const syncCalDavEventsJob = new CronJob('*/60 * * * *', syncCalDavCronJob); // every hour
  syncCalDavEventsJob.start();

  const syncCalDavConnectedUsersJob = new CronJob(
    '*/2 * * * *',
    syncCalDavCronJobConnectedUsers
  ); // every two minutes
  syncCalDavConnectedUsersJob.start();
};
