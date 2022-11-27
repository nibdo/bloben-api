import { clearLogs } from './clearLogs';
import { syncCalDavCronJob } from './cronJobs/syncCalDavCronJob';
import { syncCalDavCronJobConnectedUsers } from './cronJobs/syncCalDavCronJobConnectedUsers';

import { CronJob } from 'cron';
import { calculateRepeatedReminders } from './cronJobs/calculateRepatedReminders';
import { calculateWebcalAlarms } from './cronJobs/calculateWebcalAlarms';
import { getImapEmails } from './cronJobs/getImapEmails';
import { groupLogsCronJob } from './cronJobs/groupLogsCronJob';
import { resetEmailDailyLimit } from './cronJobs/resetEmailDailyLimit';
import { sendNotification } from './cronJobs/sendNotification';
import { syncCardDavCronJobConnectedUsers } from './cronJobs/syncCardDavCronJobConnectedUsers';
import { webcalSyncQueueSocketJob } from './queueJobs/syncWebcalEventsQueueJob';

export const initCronJobs = () => {
  const resetEmailDailyLimitJob = new CronJob(
    '15 00 * * *',
    resetEmailDailyLimit
  );
  resetEmailDailyLimitJob.start();

  // clean logs
  const clearLogsJob = new CronJob('0 1 * * *', clearLogs);
  clearLogsJob.start();

  const webcalJob = new CronJob('*/30 * * * *', webcalSyncQueueSocketJob);
  webcalJob.start();

  const syncCalDavEventsJob = new CronJob('*/60 * * * *', syncCalDavCronJob); // every hour
  syncCalDavEventsJob.start();

  const syncCalDavConnectedUsersJob = new CronJob(
    '*/10 * * * *',
    syncCalDavCronJobConnectedUsers
  ); // every ten minutes
  syncCalDavConnectedUsersJob.start();

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

  const calculateWebcalReminders = new CronJob(
    '5 4 * * *',
    calculateWebcalAlarms
  );
  calculateWebcalReminders.start();

  const getImapEmailsJob = new CronJob('*/30 * * * *', getImapEmails());
  getImapEmailsJob.start();

  const syncCardDavJob = new CronJob(
    '*/10 * * * *',
    syncCardDavCronJobConnectedUsers
  );
  syncCardDavJob.start();
};
