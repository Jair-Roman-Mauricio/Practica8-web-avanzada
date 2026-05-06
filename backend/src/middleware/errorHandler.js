import { ValidationError, UniqueConstraintError } from 'sequelize';
import { AppError } from '../utils/AppError.js';

export const notFound = (req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Registro duplicado', code: 'DUPLICATE_RECORD' });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Datos inválidos',
      code: 'ORM_VALIDATION_ERROR',
      errors: error.errors.map((item) => ({ field: item.path, message: item.message }))
    });
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || 'Error interno del servidor',
    code: error.code || 'INTERNAL_ERROR'
  };

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    payload.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
};

