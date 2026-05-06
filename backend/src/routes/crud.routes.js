import { Router } from 'express';
import { createCrudController } from '../controllers/crud.controller.js';
import {
  Especialidad,
  Laboratorio,
  Medicamento,
  TipoMedicamento
} from '../models/index.js';
import { autorizar } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  catalogoSchema,
  idParamSchema,
  laboratorioSchema,
  medicamentoSchema
} from '../schemas/index.js';

const buildCrudRoutes = (
  controller,
  schema,
  { readRoles = ['ADMIN', 'VENDEDOR', 'ALMACEN'], writeRoles = ['ADMIN'] } = {}
) => {
  const router = Router();
  router.use(autorizar(...readRoles));
  router.get('/', controller.listar);
  router.get('/:id', validate(idParamSchema), controller.obtener);
  router.post('/', autorizar(...writeRoles), validate(schema), controller.crear);
  router.put('/:id', autorizar(...writeRoles), validate(idParamSchema), validate(schema), controller.actualizar);
  router.delete('/:id', autorizar(...writeRoles), validate(idParamSchema), controller.eliminar);
  return router;
};

export const medicamentosRoutes = buildCrudRoutes(
  createCrudController(Medicamento, {
    include: [TipoMedicamento, Especialidad],
    order: [['descripcionMed', 'ASC']]
  }),
  medicamentoSchema,
  { readRoles: ['ADMIN', 'VENDEDOR', 'ALMACEN'], writeRoles: ['ADMIN'] }
);

export const laboratoriosRoutes = buildCrudRoutes(
  createCrudController(Laboratorio, { order: [['razonSocial', 'ASC']] }),
  laboratorioSchema,
  { readRoles: ['ADMIN', 'ALMACEN'], writeRoles: ['ADMIN'] }
);

export const tiposMedicamentoRoutes = buildCrudRoutes(
  createCrudController(TipoMedicamento, { order: [['descripcion', 'ASC']] }),
  catalogoSchema,
  { readRoles: ['ADMIN'], writeRoles: ['ADMIN'] }
);

export const especialidadesRoutes = buildCrudRoutes(
  createCrudController(Especialidad, { order: [['descripcion', 'ASC']] }),
  catalogoSchema,
  { readRoles: ['ADMIN'], writeRoles: ['ADMIN'] }
);
