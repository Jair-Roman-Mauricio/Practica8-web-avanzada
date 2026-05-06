import { loginUsuario, registrarUsuario } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { usuario, token } = await registrarUsuario(req.validated.body);
  res.status(201).json({ usuario, token });
});

export const login = asyncHandler(async (req, res) => {
  const { usuario, token } = await loginUsuario(req.validated.body);
  res.json({ usuario, token });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ usuario: req.usuario });
});

