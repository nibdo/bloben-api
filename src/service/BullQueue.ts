import { BULL_QUEUE } from '../utils/enums';
import { Queue, Worker } from 'bullmq';
import { env } from '../index';
import { syncCalDavQueueJob } from '../jobs/queueJobs/syncCalDavQueueJob';

export let calDavSyncBullWorker;
export let calDavSyncBullQueue;

export const createBullQueue = (queueName: BULL_QUEUE) => {
  return new Queue(queueName, {
    connection: {
      host: env.redis.host,
      port: env.redis.port,
    },
  });
};

export const createCalDavSyncBullWorker = async () => {
  const worker = new Worker(
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

  return worker;
};

export const initBullQueue = async () => {
  calDavSyncBullQueue = createBullQueue(BULL_QUEUE.CALDAV_SYNC);
  calDavSyncBullWorker = await createCalDavSyncBullWorker();
};
