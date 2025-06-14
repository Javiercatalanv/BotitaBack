
import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { Reserva } from '../schemas/reserva.schema';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('reservas')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  //Crea una reserva
  @Roles('user', 'admin')
  @Post()
  create(@Body() reserva: any , @Req() req) {
    const userId = req.user?.id || req.user?.sub;
    console.log('👉 USER ID:', userId);
    const reservaConUsuario = {...reserva, user: userId};
    return this.reservasService.create(reservaConUsuario);
    
  }

  @Roles('user', 'admin')
  @Get()
  getUserReservas(@Req() req) {
    const userId = req.user?.id;
    console.log('🔎 Buscando reservas del usuario:', userId);
    return this.reservasService.findByUser(userId);
  }

  //El admin puede obtener todas las canchas reservadas
  @Roles('admin')
  @Get()
  findAll() {
    return this.reservasService.findAll();
  }

  //Para encontrar el id de la reserva
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservasService.findOne(id);
  }

  //Se confirma la reserva
  @Patch(':id/confirmar')
  confirmarReserva(@Param('id') id: string) {
    return this.reservasService.confirmarReserva(id);
  }

  //Se cancela la reserva
  @Patch(':id/cancelar')
  cancelarReserva(@Param('id') id: string) {
    return this.reservasService.cancelarReserva(id);
  }

  // Solo admin puede modificar reservaciones
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() reserva: Partial<Reserva>) {
    return this.reservasService.update(id, reserva);
  }

   // Solo admin puede eliminar reservaciones
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservasService.remove(id);
  }

  //Los admin pueden calcular los ingresos totales
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/reportes/ingresos')
  calcularIngresos() {
    return this.reservasService.calcularIngresosTotales();
  }
  //Los admin pueden calcular los ingresos mensuales
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/reportes/ingresos-mensuales')
  ingresosMensuales() {
    return this.reservasService.calcularIngresosMensuales();
  }

  //Los admin pueden ver un Historial de todas las canchas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/historico')
  obtenerHistoricoAdmin() {
    return this.reservasService.obtenerHistoricoGlobal();
  }

  //Los usuarios pueden ver un Historial de las canchas que han reservado
  @UseGuards(JwtAuthGuard)
  @Get('/mis-reservas/historico')
  obtenerHistoricoUsuario(@Req() req) {
    return this.reservasService.obtenerHistoricoUsuario(req.user.userId);
  }

}

