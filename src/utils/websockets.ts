import { LOG_TAG, REDIS_PREFIX, SOCKET_ROOM_NAMESPACE } from './enums';
import { SocketSession } from '../common/interface/common';
import { io } from '../app';
import { redisClient } from '../index';
import logger from './logger';

const getSocketSession = async (socket: any): Promise<SocketSession | null> => {
  const socketId: string = socket.handshake.auth.token;

  const redisKey = `${REDIS_PREFIX.SOCKET}_${socketId}`;

  const data: string = await redisClient.get(redisKey);

  if (!data) {
    return null;
    // throw throwError_old(ERRORS.NOT_AUTHORIZED, req);
  }

  return JSON.parse(data);
};

const handleJoinRoom = async (socket: any) => {
  const socketSession: SocketSession = await getSocketSession(socket);

  if (socketSession?.userID) {
    await redisClient.set(
      `${REDIS_PREFIX.WAS_ACTIVE}_${socketSession.userID}`,
      true,
      'EX',
      60 * 60
    ); // 1 hour

    socket.join(`${SOCKET_ROOM_NAMESPACE.USER_ID}${socketSession.userID}`);
  }
};

export const initWebsockets = () => {
  io.on('connection', async (socket: any) => {
    await handleJoinRoom(socket);
  });
  io.on('error', (error: any) => {
    logger.error(error.toString(), 'ws', [LOG_TAG.WEBSOCKET]);
  });
};
