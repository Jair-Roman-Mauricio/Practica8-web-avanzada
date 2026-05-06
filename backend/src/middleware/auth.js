import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Usuario } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const autenticar = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new AppError('Token requerido', 401, 'AUTH_REQUIRED');
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const usuario = await Usuario.findByPk(payload.id);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no autorizado', 401, 'AUTH_INVALID');
    }
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Token inválido o expirado', 401, 'AUTH_INVALID');
  }
});

export const autorizar = (...roles) => (req, _res, next) => {
  if (!req.usuario) {
    return next(new AppError('Autenticación requerida', 401, 'AUTH_REQUIRED'));
  }
  if (!roles.includes(req.usuario.rol)) {
    return next(new AppError('No tienes permisos para esta operación', 403, 'FORBIDDEN'));
  }
  return next();
};

