import { Usuario } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarUsuarios = asyncHandler(async (_req, res) => {
  const usuarios = await Usuario.findAll({ order: [['createdAt', 'DESC']] });
  res.json(usuarios);
});

export const crearUsuario = asyncHandler(async (req, res) => {
  const existente = await Usuario.findOne({ where: { email: req.validated.body.email } });
  if (existente) throw new AppError('El email ya está registrado', 409, 'USER_DUPLICATED');
  const usuario = await Usuario.create(req.validated.body);
  res.status(201).json(usuario);
});

export const actualizarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  await usuario.update(req.validated.body);
  res.json(usuario);
});

export const eliminarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  await usuario.destroy();
  res.status(204).send();
});

