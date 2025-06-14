import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { Reserva, ReservaSchema } from '../schemas/reserva.schema';
import { Cancha, CanchaSchema } from '../schemas/cancha.schema'; 
import { NotificationsModule } from 'src/notificaciones/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reserva.name, schema: ReservaSchema },
      { name: Cancha.name, schema: CanchaSchema } 
    ]),
    NotificationsModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
