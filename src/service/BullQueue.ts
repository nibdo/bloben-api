import { BULL_QUEUE } from '../utils/enums';
import { Queue, Worker } from 'bullmq';
import { env } from '../index';
import { processEmailEventJob } from '../jobs/queueJobs/processEmailEventJob';
import { sendEmailQueueJob } from '../jobs/queueJobs/sendEmailQueueJob';
import { syncCalDavQueueJob } from '../jobs/queueJobs/syncCalDavQueueJob';
import { syncCalDavTaskQueueJob } from '../jobs/queueJobs/syncCalDavTaskQueueJob';
import { syncWebcalEventsQueueJob } from '../jobs/queueJobs/syncWebcalEventsQueueJob';

export let calDavSyncBullWorker;
export let calDavSyncBullQueue;
export let calDavTaskSyncBullQueue;
export let webcalSyncBullWorker;
export let webcalSyncBullQueue;
export let emailBullQueue;
export let emailBullWorker;
export let emailInviteBullQueue;
export let emailInviteBullWorker;

export const createBullQueue = (queueName: BULL_QUEUE) => {
  return new Queue(queueName, {
    connection: {
      host: env.redis.host,
      port: env.redis.port,
    },
  });
};

export const createCalDavSyncBullWorker = async () => {
  return new Worker(
    BULL_QUEUE.CALDAV_SYNC,
    async (job) => {
      await syncCalDavQueueJob(job);
    },
    {
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
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
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
    }
  );
};
export const createCalDavTaskSyncBullWorker = async () => {
  return new Worker(
    BULL_QUEUE.CALDAV_TASK_SYNC,
    async (job) => {
      await syncCalDavTaskQueueJob(job);
    },
    {
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
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
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
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
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
    }
  );
};

export const initBullQueue = async () => {
  calDavSyncBullQueue = createBullQueue(BULL_QUEUE.CALDAV_SYNC);
  calDavSyncBullWorker = await createCalDavSyncBullWorker();

  webcalSyncBullQueue = createBullQueue(BULL_QUEUE.WEBCAL_SYNC);
  webcalSyncBullWorker = await createWebcalSyncBullWorker();

  calDavTaskSyncBullQueue = createBullQueue(BULL_QUEUE.CALDAV_TASK_SYNC);
  calDavSyncBullWorker = await createCalDavTaskSyncBullWorker();

  emailBullQueue = createBullQueue(BULL_QUEUE.EMAIL);
  emailBullWorker = await createEmailBullWorker();

  emailInviteBullQueue = createBullQueue(BULL_QUEUE.EMAIL_INVITE);
  emailInviteBullWorker = await createEmailInviteBullWorker();
};
