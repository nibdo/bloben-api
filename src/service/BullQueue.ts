import { BULL_QUEUE } from '../utils/enums';
import { Queue, Worker } from 'bullmq';
import { calculateWebcalAlarms } from '../jobs/queueJobs/calculateWebcalAlarmsJob';
import { createRedisConfig } from '../config/redis';
import { isElectron } from '../config/env';
import { processEmailEventJob } from '../jobs/queueJobs/processEmailEventJob';
import { sendEmailQueueJob } from '../jobs/queueJobs/sendEmailQueueJob';
import { syncCalDavQueueJob } from '../jobs/queueJobs/syncCalDavQueueJob';
import { syncCardDavQueueJob } from '../jobs/queueJobs/syncCardDavQueueJob';
import { syncWebcalEventsQueueJob } from '../jobs/queueJobs/syncWebcalEventsQueueJob';
import Logger from '../utils/logger';

export let calDavSyncBullWorker;
export let calDavSyncBullQueue;
export let webcalSyncBullWorker;
export let webcalSyncBullQueue;
export let sendEmailBullQueue;
export let emailBullWorker;
export let emailInviteBullQueue;
export let emailInviteBullWorker;
export let webcalRemindersBullQueue;
export let webcalRemindersBullWorker;
export let cardDavBullWorker;
export let cardDavBullQueue;

const getConnection = () => {
  if (isElectron) {
    return;
  }

  const config = createRedisConfig();

  if (config.host && config.port) {
    return {
      host: config.host,
      port: config.port,
    };
  } else {
    const url = new URL(config);

    if (url) {
      return {
        host: url.hostname,
        port: Number(url.port),
        username: url.username,
        password: url.password,
      };
    }
  }
};

const connection = getConnection();

export const createBullQueue = (queueName: BULL_QUEUE) => {
  return new Queue(queueName, {
    connection: connection,
  });
};

export const createCalDavSyncBullWorker = async () => {
  return new Worker(
    BULL_QUEUE.CALDAV_SYNC,
    async (job) => {
      await syncCalDavQueueJob(job);
    },
    {
      connection,
    }
  );
};
export const createEmailBullWorker = async () => {
  return new Worker(
    BULL_QUEUE.EMAIL,
    async (job) => {
      await sendEmailQueueJob(job);
    },
    {
      connection,
    }
  );
};

export const createWebcalSyncBullWorker = async () => {
  return new Worker(
    BULL_QUEUE.WEBCAL_SYNC,
    async (job) => {
      await syncWebcalEventsQueueJob(job);
    },
    {
      connection,
    }
  );
};

export const createEmailInviteBullWorker = async () => {
  return new Worker(
    BULL_QUEUE.EMAIL_INVITE,
    async (job) => {
      await processEmailEventJob(job);
    },
    {
      connection,
    }
  );
};

export const createWebcalRemindersBullQueue = async () => {
  return new Worker(
    BULL_QUEUE.WEBCAL_REMINDER,
    async (job) => {
      await calculateWebcalAlarms(job);
    },
    {
      connection,
    }
  );
};

export const createCardDavBullQueue = async () => {
  return new Worker(
    BULL_QUEUE.CARDDAV_SYNC,
    async (job) => {
      await syncCardDavQueueJob(job);
    },
    {
      connection,
    }
  );
};

export const initBullQueue = async () => {
  if (isElectron) {
    return;
  }

  calDavSyncBullQueue = createBullQueue(BULL_QUEUE.CALDAV_SYNC);
  calDavSyncBullWorker = await createCalDavSyncBullWorker();

  webcalSyncBullQueue = createBullQueue(BULL_QUEUE.WEBCAL_SYNC);
  webcalSyncBullWorker = await createWebcalSyncBullWorker();

  sendEmailBullQueue = createBullQueue(BULL_QUEUE.EMAIL);
  emailBullWorker = await createEmailBullWorker();

  emailInviteBullQueue = createBullQueue(BULL_QUEUE.EMAIL_INVITE);
  emailInviteBullWorker = await createEmailInviteBullWorker();

  webcalRemindersBullQueue = createBullQueue(BULL_QUEUE.WEBCAL_REMINDER);
  webcalRemindersBullWorker = await createWebcalRemindersBullQueue();

  cardDavBullQueue = createBullQueue(BULL_QUEUE.CARDDAV_SYNC);
  cardDavBullWorker = await createCardDavBullQueue();

  Logger.info('[INIT]: BullQueue initialized');
};
