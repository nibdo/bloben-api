import { BULL_QUEUE } from '../utils/enums';
import { Queue, Worker } from 'bullmq';
import { env } from '../index';
import { syncCalDavQueueJob } from '../jobs/queueJobs/syncCalDavQueueJob';
import { syncWebcalEventsQueueJob } from '../jobs/queueJobs/syncWebcalEventsQueueJob';

export let calDavSyncBullWorker;
export let calDavSyncBullQueue;
export let webcalSyncBullWorker;
export let webcalSyncBullQueue;

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

export const initBullQueue = async () => {
  calDavSyncBullQueue = createBullQueue(BULL_QUEUE.CALDAV_SYNC);
  calDavSyncBullWorker = await createCalDavSyncBullWorker();

  webcalSyncBullQueue = createBullQueue(BULL_QUEUE.WEBCAL_SYNC);
  webcalSyncBullWorker = await createWebcalSyncBullWorker();
};
