import { LOG_TAG, REDIS_PREFIX, SOCKET_ROOM_NAMESPACE } from './enums';
import { MemoryClient, socketService } from '../service/init';
import { SocketSession } from '../common/interface/common';
import Logger from './logger';

const getSocketSession = async (socket: any): Promise<SocketSession | null> => {
  const socketId: string = socket.handshake.auth.token;

  const redisKey = `${REDIS_PREFIX.SOCKET}_${socketId}`;

  const data: string = await MemoryClient.get(redisKey);

  if (!data) {
    return null;
    // throw throwError_old(ERRORS.NOT_AUTHORIZED, req);
  }

  return JSON.parse(data);
};

const handleJoinRoom = async (socket: any) => {
  const socketSession: SocketSession = await getSocketSession(socket);

  if (socketSession?.userID) {
    await MemoryClient.set(
      `${REDIS_PREFIX.WAS_ACTIVE}_${socketSession.userID}`,
      'true',
      'EX',
      60 * 60
    ); // 1 hour

    socket.join(`${SOCKET_ROOM_NAMESPACE.USER_ID}${socketSession.userID}`);
  }
};

export const initWebsockets = () => {
  socketService.io.on('connection', async (socket: any) => {
    await handleJoinRoom(socket);
  });
  socketService.io.on('error', (error: any) => {
    Logger.error(error.toString(), 'ws', [LOG_TAG.WEBSOCKET]);
  });

  Logger.info('[INIT]: Websockets initialized');
};
