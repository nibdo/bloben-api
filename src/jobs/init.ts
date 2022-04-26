import { clearLogs } from './clearLogs';
import { syncCalDavCronJob } from './cronJobs/syncCalDavCronJob';
import { syncCalDavCronJobConnectedUsers } from './cronJobs/syncCalDavCronJobConnectedUsers';

import { CronJob } from 'cron';
import { calculateRepeatedReminders } from './cronJobs/calculateRepatedReminders';
import { groupLogsCronJob } from './cronJobs/groupLogsCronJob';
import { sendNotification } from './cronJobs/sendNotification';
import { syncCalDavTaskCronJobConnectedUsers } from './cronJobs/syncCalDavTaskCronJobConnectedUsers';
import { webcalSyncQueueSocketJob } from './queueJobs/syncWebcalEventsQueueJob';

export const initCronJobs = () => {
  // clean logs
  const clearLogsJob = new CronJob('0 1 * * *', clearLogs);
  clearLogsJob.start();

  const webcalJob = new CronJob('*/30 * * * *', webcalSyncQueueSocketJob);
  webcalJob.start();

  const syncCalDavEventsJob = new CronJob('*/60 * * * *', syncCalDavCronJob); // every hour
  syncCalDavEventsJob.start();

  const syncCalDavConnectedUsersJob = new CronJob(
    '*/3 * * * *',
    syncCalDavCronJobConnectedUsers
  ); // every two minutes
  syncCalDavConnectedUsersJob.start();

  const syncCalDavTodoConnectedUsersJob = new CronJob(
    '*/10 * * * *',
    syncCalDavTaskCronJobConnectedUsers
  );
  syncCalDavTodoConnectedUsersJob.start();

  const groupLogsJob = new CronJob('10 */3 * * *', groupLogsCronJob); // At
  // minute 10 past every 3rd hour
  groupLogsJob.start();

  const remindersJob = new CronJob('*/1 * * * *', sendNotification); // every two minutes
  remindersJob.start();

  const calculateRepeatedRemindersJob = new CronJob(
    '10 */12 * * *',
    calculateRepeatedReminders
  );
  calculateRepeatedRemindersJob.start();
};
