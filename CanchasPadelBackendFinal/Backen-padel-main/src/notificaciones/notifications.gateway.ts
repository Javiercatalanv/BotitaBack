import {WebSocketGateway,WebSocketServer,} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  //Envia una notificacion al front
  sendNotification(message: string ) {
    this.server.emit('notification', message);
  }
}
