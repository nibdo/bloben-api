import { Server } from 'socket.io';

export class SocketService {
  public io: Server | null = null;
  private socketCallback: any = null;

  constructor(io?: Server, socketCallback?: any) {
    if (io) {
      this.io = io;
    }

    if (socketCallback) {
      this.socketCallback = socketCallback;
    }
  }

  public emit(data: string, channel: string, room?: string) {
    if (this.io) {
      this.io.to(room).emit(channel, data);
    } else if (this.socketCallback) {
      this.socketCallback(channel, data);
    }
  }
}
