// init memory client
import { ElectronService } from './ElectronService';
import { MemoryDbService } from './MemoryDbService';
import { QueueService } from './QueueService';
import { Server } from 'socket.io';
import { SocketService } from './SocketService';
import { createSocketOptions } from '../config/socketio';
import { initBullQueue } from './BullQueue';
import { isElectron } from '../config/env';
import Logger from '../utils/logger';

export let MemoryClient: MemoryDbService;

export let QueueClient: QueueService;

export let socketService: SocketService;

export let electronService: ElectronService;

export const initServices = async () => {
  MemoryClient = new MemoryDbService(isElectron);

  if (!isElectron) {
    await initBullQueue();
  }

  QueueClient = new QueueService(isElectron);

  electronService = new ElectronService(isElectron);

  Logger.info('[INIT]: Services initialized');
};

export const initSocketService = (socketCallback?: any, server?: any) => {
  if (isElectron) {
    socketService = new SocketService(undefined, socketCallback);
  } else {
    socketService = new SocketService(
      new Server(server, createSocketOptions())
    );
  }
};
