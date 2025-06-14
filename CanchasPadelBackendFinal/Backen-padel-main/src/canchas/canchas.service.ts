import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cancha, CanchaDocument } from '../schemas/cancha.schema';
import { Reserva, ReservaDocument } from '../schemas/reserva.schema';

@Injectable()
export class CanchasService {
  constructor(
    @InjectModel(Cancha.name) private canchaModel: Model<CanchaDocument>,
    @InjectModel(Reserva.name) private reservaModel: Model<ReservaDocument>,
  ) {}

  //Retorna las canchas disponibles
  async obtenerDisponibles(fechaInicio: Date, fechaFin: Date) {
    const reservas = await this.reservaModel.find({
      $or: [
        { fechaInicio: { $lt: fechaFin }, fechaFin: { $gt: fechaInicio } },
      ],
    });

    const canchasOcupadas = reservas.map(r => r.cancha);

    const canchasDisponibles = await this.canchaModel.find({
      nombre: { $nin: canchasOcupadas },
    });

    return canchasDisponibles;
  }

  //Retorna la nueva cancha
  async create(data: Partial<Cancha>) {
    return new this.canchaModel(data).save();
  }
  
  //Actualiza la cancha con id
  async update(id: string, data: Partial<Cancha>) {
    return this.canchaModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  //Elimina la cancha con  id
  async remove(id: string) {
    return this.canchaModel.findByIdAndDelete(id).exec();
  }

  //Retorna todas las canchas
  async findAll() {
  return this.canchaModel.find().exec();
  }

  //Retorna la cancha con id
  async findOne(id: string) {
    return this.canchaModel.findById(id).exec();
  }

  //Retorna todas las canchas con su estado y reservas
  async getTodasConEstadoYReservas() {
  const canchas = await this.canchaModel.find();
  const reservas = await this.reservaModel.find({
    estado: { $ne: 'cancelada' }
  }).populate('cancha').exec();

  return canchas.map(cancha => {
    const reservasDeLaCancha = reservas.filter(r => r.cancha.toString() === cancha.id.toString());


    return {
      ...cancha.toObject(),
      ocupada: reservasDeLaCancha.length > 0,
      reservas: reservasDeLaCancha.map(r => ({fechaInicio: r.fechaInicio, fechaFin: r.fechaFin, jugadores: r.jugadores, estado: r.estado
      }))
    };
  });
}
}