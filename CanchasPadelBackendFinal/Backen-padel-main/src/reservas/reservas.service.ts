import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reserva, ReservaDocument } from '../schemas/reserva.schema';
import { Cancha, CanchaDocument } from '../schemas/cancha.schema';
import { NotificationsGateway } from '../notificaciones/notifications.gateway';


@Injectable()
export class ReservasService {
  constructor(
    @InjectModel(Reserva.name) private reservaModel: Model<ReservaDocument>,
    @InjectModel(Cancha.name) private canchaModel: Model<CanchaDocument>,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  async findByUser(userId: string): Promise<Reserva[]> {
    return this.reservaModel.find({ user: userId }).populate('cancha').exec();
  }

  //Crea una reserva teniendo en cuenta las restricciones de tiempo.
  async create(data: Partial<Reserva>) {
    const { cancha, fechaInicio, fechaFin, jugadores } = data;

    if (!fechaInicio || !fechaFin) {
      throw new Error('Se requiere una fecha válida para la reserva.');
    }

    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const diasDiferencia = (inicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);

    if (diasDiferencia < 7) {
      throw new Error('Las reservas deben hacerse con al menos 1 semana de anticipación.');
    }

    const canchaInfo = await this.canchaModel.findById(cancha);
    if (!canchaInfo) {
      throw new Error('Cancha no encontrada.');
    }

    if (!jugadores || jugadores.length > canchaInfo.maxJugadores) {
      throw new Error(`Esta cancha permite un máximo de ${canchaInfo.maxJugadores} jugadores.`);
    }

    const reservaExistente = await this.reservaModel.findOne({
      cancha,
      $or: [
        { fechaInicio: { $lt: fechaFin }, fechaFin: { $gt: fechaInicio } }
      ],
      estado: { $ne: 'cancelada' },
    });

    if (reservaExistente) {
      throw new Error('La cancha ya está reservada en ese rango de fechas.');
    }

    const reserva = new this.reservaModel({
      ...data,
      estado: 'pendiente',
      estadoPago: 'pendiente',
    });

    this.notificationsGateway.sendNotification(
    `Nueva reserva creada en Cancha ${canchaInfo.nombre} para el día ${new Date(fechaInicio).toLocaleString('es-CL')}`
    );

    return reserva.save();
  }

    // Método para procesar el pago de una reserva
   async procesarPago(id: string) {
    const reserva = await this.reservaModel.findById(id).populate('cancha');
    
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    if (reserva.estadoPago === 'pagado') {
      throw new Error('Esta reserva ya ha sido pagada');
    }

    if (reserva.estado === 'cancelada') {
      throw new Error('No se puede pagar una reserva cancelada');
    }

    // Pago automático al presionar el botón
    reserva.estadoPago = 'pagado';
    reserva.fechaPago = new Date();
    
    // Cambiar estado a confirmada automáticamente al pagar
    if (reserva.estado === 'pendiente') {
      reserva.estado = 'confirmada';
    }

    await reserva.save();
     // Envia una notificación de pago exitoso
    this.notificationsGateway.sendNotification(
     `El pago ha sido procesado exitosamente para la reserva de su cancha`,
    );

    return {
      success: true,
      message: 'Pago procesado exitosamente',
      reserva: reserva
    };

   }

   //metodo para obtener el estado de pago de una reserva
   async obtenerEstadoPago(id: string) {
    const reserva = await this.reservaModel.findById(id).populate('cancha');
    
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    return {
      reservaId: reserva._id,
      estadoPago: reserva.estadoPago,
      fechaPago: reserva.fechaPago,
      cancha: (reserva.cancha as any)?.nombre
    };
  }

  //Para cancelar la Reserva
  async cancelarReserva(id: string) {
    const reserva = await this.reservaModel.findById(id);
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    const hoy = new Date();
    const fechaInicio = new Date(reserva.fechaInicio);
    const diasDiferencia = (fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);

    if (diasDiferencia < 7) {
      throw new Error('Solo se puede cancelar hasta una semana antes de la fecha reservada.');
    }

    reserva.estado = 'cancelada';
    this.notificationsGateway.sendNotification(
    `Reserva cancelada para la cancha ${reserva.cancha}`,
    );

    return reserva.save();
  }

  //Para confirmar la reserva
  async confirmarReserva(id: string) {
    const reserva = await this.reservaModel.findById(id);

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    if (reserva.estado == 'confirmada') {
      throw new Error('La reserva ya está confirmada');
    }
    reserva.estado = 'confirmada';
    this.notificationsGateway.sendNotification(
    `Reserva confirmada para la cancha ${reserva.cancha}`,
  );

    return reserva.save();
  }

  async findAll(): Promise<Reserva[]> {
    return this.reservaModel.find().populate('cancha').exec();
  }

  findOne(id: string) {
    return this.reservaModel.findById(id).exec();
  }

  //Actualiza la reserva
 async update(id: string, data: Partial<Reserva>) {
    const reservaActualizada = await this.reservaModel.findByIdAndUpdate(id, data, { new: true }).exec();

    if (reservaActualizada) {
      const cancha = await this.canchaModel.findById(reservaActualizada.cancha);
      const nombreCancha = cancha?.nombre || 'desconocida';

      this.notificationsGateway.sendNotification(
        `✏️ Se modificó tu reserva en Cancha ${nombreCancha} para el día ${new Date(reservaActualizada.fechaInicio).toLocaleString('es-CL')}.`
      );
    }

    return reservaActualizada;
  }

  remove(id: string) {
    return this.reservaModel.findByIdAndDelete(id).exec();
  }

  //Permite calcular los ingresos hasta la fecha
  async calcularIngresosTotales() {
  const reservas = await this.reservaModel.find({ estado: 'confirmada' }).populate('cancha').exec();

  const total = reservas.reduce((sum, reserva) => {
    const costo = (reserva.cancha as any)?.costo ?? 0;
    return sum + costo;
  }, 0);

  return { total };
  }

  //Permite calcular los ingresos por mes
  async calcularIngresosMensuales() {
  const reservas = await this.reservaModel.find({ estado: 'confirmada' }).populate('cancha').exec();

  const ingresosPorMes: Record<string, number> = {};

  reservas.forEach((reserva) => {
    const fecha = new Date(reserva.fechaInicio);
    const mesAnio = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
    const costo = (reserva.cancha as any)?.costo ?? 0;

    ingresosPorMes[mesAnio] = (ingresosPorMes[mesAnio] || 0) + costo;
  });

  return ingresosPorMes;
}
  //Permite obtener el Historial de reservas de todas las canchas
  async obtenerHistoricoGlobal() {
    const hoy = new Date();
    return this.reservaModel.find({ fechaFin: { $lt: hoy } }).populate('cancha usuario').exec();
  }

  //Permite que el usuario conozca su historial de reservas
  async obtenerHistoricoUsuario(userId: string) {
    const hoy = new Date();
    return this.reservaModel.find({ usuario: userId, fechaFin: { $lt: hoy } }).populate('cancha').exec();
  }

}
