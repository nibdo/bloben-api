/* eslint-disable */
import {
  calDavSyncBullQueue,
  calDavSyncBullWorker,
  calDavTaskSyncBullQueue,
  cardDavBullQueue,
  emailBullQueue,
  emailBullWorker,
  webcalSyncBullQueue,
  webcalSyncBullWorker,
} from '../../service/BullQueue';

export const mockBullQueue = () => {
  const mockFunc = {
    add: async (key: string, data: any) => {
      return Promise.resolve();
    },
  };
  // @ts-ignore
  calDavSyncBullWorker = mockFunc;
  // @ts-ignore
  calDavSyncBullQueue = mockFunc;
  // @ts-ignore
  calDavTaskSyncBullQueue = mockFunc;
  // @ts-ignore
  webcalSyncBullWorker = mockFunc;
  // @ts-ignore
  webcalSyncBullQueue = mockFunc;
  // @ts-ignore
  emailBullQueue = mockFunc;
  // @ts-ignore
  emailBullWorker = mockFunc;
  // @ts-ignore
  cardDavBullQueue = mockFunc;
};
