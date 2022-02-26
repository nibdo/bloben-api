import { ServerOptions } from 'socket.io';

export const createSocketOptions = (): Partial<ServerOptions> => ({
  path: '/api/ws',
  transports: ['websocket', 'polling'],
});
