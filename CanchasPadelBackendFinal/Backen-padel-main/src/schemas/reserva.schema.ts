import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Cancha } from './cancha.schema';
import { Usuario } from './usuario.schema';

export type ReservaDocument = Reserva & Document;

@Schema()
export class Reserva {
  @Prop({ required: true })
  nombreSocio: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cancha', required: true })
  cancha: Cancha | string;

  @Prop({ required: true })
  fechaInicio: Date;

  @Prop({ required: true })
  fechaFin: Date;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  rut: string;

  @Prop({ default: 'pendiente' })
  estado: string;

  @Prop({ required: true, default: 'pendiente' }) // se agrega estadoPago para indicar si la reserva ha sido pagada
  estadoPago: string;

  @Prop()
  fechaPago?: Date; //ademas se agrega fechaPago para registrar la fecha de pago

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  user: Usuario | string;

  @Prop({
  type: [
    {
      nombre: { type: String, required: true },
      apellido: { type: String, required: true },
      rut: { type: String, required: true },
      edad: { type: Number, required: true },
    },
  ],
  required: true,
})
jugadores: {
  nombre: string;
  apellido: string;
  rut: string;
  edad: number;
}[];

}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);
