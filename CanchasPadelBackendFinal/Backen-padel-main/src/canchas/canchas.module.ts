
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CanchasService } from './canchas.service';
import { CanchasController } from './canchas.controller';
import { Cancha, CanchaSchema } from '../schemas/cancha.schema';
import { Reserva, ReservaSchema } from '../schemas/reserva.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cancha.name, schema: CanchaSchema },
      { name: Reserva.name, schema: ReservaSchema }, 
    ]),
  ],
  controllers: [CanchasController],
  providers: [CanchasService],
  exports: [MongooseModule],
})
export class CanchasModule {}
