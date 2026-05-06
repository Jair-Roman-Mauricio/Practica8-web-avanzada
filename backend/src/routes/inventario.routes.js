import { Router } from 'express';
import {
  comprasIndex,
  comprasShow,
  comprasStore,
  ventasIndex,
  ventasShow,
  ventasStore
} from '../controllers/inventario.controller.js';
import { autorizar } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { compraSchema, idParamSchema, ventaSchema } from '../schemas/index.js';

export const comprasRoutes = Router();
comprasRoutes.use(autorizar('ADMIN', 'ALMACEN'));
comprasRoutes.get('/', comprasIndex);
comprasRoutes.get('/:id', validate(idParamSchema), comprasShow);
comprasRoutes.post('/', validate(compraSchema), comprasStore);

export const ventasRoutes = Router();
ventasRoutes.use(autorizar('ADMIN', 'VENDEDOR'));
ventasRoutes.get('/', ventasIndex);
ventasRoutes.get('/:id', validate(idParamSchema), ventasShow);
ventasRoutes.post('/', validate(ventaSchema), ventasStore);

