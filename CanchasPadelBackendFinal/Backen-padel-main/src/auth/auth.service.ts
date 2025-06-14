import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from '../schemas/usuario.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private userModel: Model<UsuarioDocument>,
    private jwtService: JwtService
  ) {}

  async register(nombre: string, email: string, password: string, role: string ='user') {
    const hash = await bcrypt.hash(password, 10);

    const correoAdmin = 'admin@canchas.cl';
    const roleFinal = email === correoAdmin ? 'admin' : 'user';
    const nuevoUsuario = new this.userModel({ nombre, email, password: hash, role:roleFinal,});
    await nuevoUsuario.save();
    return { message: 'Usuario registrado correctamente' };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Credenciales incorrectas');
    }
    const payload = { sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { token, role: user.role , user:{id: user._id, nombre: user.nombre},};
  }

  async getProfileById(id: string) {
  const user = await this.userModel.findById(id).select('nombre email');
  if (!user) {throw new Error('Usuario no encontrado');}
  return user;
}
}
