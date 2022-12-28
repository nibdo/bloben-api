import { syncCalDavCronJob } from './cronJobs/syncCalDavCronJob';

import { CronJob } from 'cron';
import { ElectronHelper } from '../utils/electronHelper';
import { calculateRepeatedReminders } from './cronJobs/calculateRepatedReminders';
import { calculateWebcalAlarms } from './cronJobs/calculateWebcalAlarms';
import { electronService } from '../service/init';
import { getImapEmails } from './cronJobs/getImapEmails';
import { resetEmailDailyLimit } from './cronJobs/resetEmailDailyLimit';
import { sendNotification } from './cronJobs/sendNotification';
import { syncCardDavCronJob } from './cronJobs/syncCardDavCronJob';
import { webcalSyncQueueSocketJob } from './queueJobs/syncWebcalEventsQueueJob';
import Logger from '../utils/logger';

export const initElectronCronJobs = async () => {
  const webcalJob = new CronJob('*/30 * * * *', webcalSyncQueueSocketJob);
  webcalJob.start();

  const syncCalDavEventsJob = new CronJob('*/10 * * * *', syncCalDavCronJob); // every 10 minutes
  syncCalDavEventsJob.start();

  const syncCardsJob = new CronJob('*/20 * * * *', syncCardDavCronJob); // every 20
  // minutes
  syncCardsJob.start();

  const remindersJob = new CronJob('*/1 * * * *', sendNotification); // every two minutes
  remindersJob.start();

  const getImapEmailsJob = new CronJob('*/30 * * * *', getImapEmails);
  getImapEmailsJob.start();

  // this need to happen on start as they don't need to run frequently but
  // cannot know exact time to run in app
  await calculateRepeatedReminders();

  await calculateWebcalAlarms();

  await ElectronHelper.setMaxEmailLimit();

  await resetEmailDailyLimit();

  await electronService.processWidgetFile();

  Logger.info('[INIT]: Cron for electron initialized');
};
