// eslint-disable-next-line unused-imports/no-unused-imports-ts,@typescript-eslint/no-unused-vars
import { MemoryClient, socketService } from '../../service/init';
import { SocketService } from '../../service/SocketService';

export const mockSocketio = () => {
  // @ts-ignore
  // eslint-disable-next-line unused-imports/no-unused-imports-ts,@typescript-eslint/no-unused-vars
  // io = {
  //   to: () => {
  //     return {
  //       emit: () => {
  //         return;
  //       },
  //     };
  //   },
  // };

  if (!socketService) {
    // @ts-ignore
    socketService = new SocketService();
  }

  socketService.io = {
    to: () => {
      return {
        emit: () => {
          return;
        },
      };
    },
    on: () => {
      return {};
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  socketService.emit = (_data: string) => '';
};
