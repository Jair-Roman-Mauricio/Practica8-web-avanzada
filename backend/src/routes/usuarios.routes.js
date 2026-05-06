import { Router } from 'express';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios
} from '../controllers/usuarios.controller.js';
import { autorizar } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, usuarioSchema } from '../schemas/index.js';

export const usuariosRoutes = Router();

usuariosRoutes.use(autorizar('ADMIN'));
usuariosRoutes.get('/', listarUsuarios);
usuariosRoutes.post('/', validate(usuarioSchema), crearUsuario);
usuariosRoutes.put('/:id', validate(idParamSchema), validate(usuarioSchema), actualizarUsuario);
usuariosRoutes.delete('/:id', validate(idParamSchema), eliminarUsuario);

