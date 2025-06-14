import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservasModule } from './reservas/reservas.module';
import { NotificationsModule } from './notificaciones/notifications.module';
import { AuthModule } from './auth/auth.module';
import { CanchasModule } from './canchas/canchas.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/padel'),
    ReservasModule,NotificationsModule,AuthModule,CanchasModule,
  ],
  
})
export class AppModule {}
