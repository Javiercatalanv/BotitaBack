import { Controller, Get, Query } from '@nestjs/common';
import { CanchasService } from './canchas.service';
import { Body, Delete, Param, Post, Put } from '@nestjs/common';
import { Cancha } from '../schemas/cancha.schema';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('canchas')
export class CanchasController {
  constructor(private readonly canchasService: CanchasService) {}

  //Entrega las canchas disponibles
  @Get('disponibles')
  async getDisponibles(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string,
  ) {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return this.canchasService.obtenerDisponibles(fechaInicio, fechaFin);
  }

  //Crea una cancha
  @Post()
  create(@Body() cancha: Partial<Cancha>) {
    return this.canchasService.create(cancha);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() cancha: Partial<Cancha>) {
    return this.canchasService.update(id, cancha);
  }

  //Elimina una cancha
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.canchasService.remove(id);
  }

  //Entrega todas las canchas
  @Get()
  findAll() {
    return this.canchasService.findAll();
  }

  //Entrga una cancha en especifico
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.canchasService.findOne(id);
  }

  //Entrega todas las canchas junto con su estado y reservas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getTodasConEstado() {
    return this.canchasService.getTodasConEstadoYReservas();
  }
}