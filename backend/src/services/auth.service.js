import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Usuario } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const signToken = (usuario) => jwt.sign(
  { id: usuario.id, rol: usuario.rol },
  env.jwtSecret,
  { expiresIn: env.jwtExpiresIn }
);

export const registrarUsuario = async ({ nombre, email, password, rol = 'VENDEDOR' }) => {
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    throw new AppError('El email ya está registrado', 409, 'USER_DUPLICATED');
  }
  if (rol === 'ADMIN') {
    throw new AppError('El registro público no puede crear administradores', 403, 'ADMIN_REGISTER_FORBIDDEN');
  }

  const usuario = await Usuario.create({ nombre, email, password, rol });
  return { usuario, token: signToken(usuario) };
};

export const loginUsuario = async ({ email, password }) => {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario || !usuario.activo || !(await usuario.validarPassword(password))) {
    throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  return { usuario, token: signToken(usuario) };
};
