import { ImportMock } from 'ts-mock-imports';
import {
  calDavSyncBullQueue,
  webcalSyncBullQueue,
} from '../../service/BullQueue';

export const mockBullQueue = () => {
  const mockManagerWebcal = ImportMock.mockClass(
    webcalSyncBullQueue,
    'webcalSyncBullQueue'
  );
  const mockManager = ImportMock.mockClass(
    calDavSyncBullQueue,
    'calDavSyncBullQueue'
  );
  // @ts-ignore
  mockManager.set('add', () => {
    return;
  });

  // @ts-ignore
  mockManagerWebcal.set('add', () => {
    return;
  });
};
