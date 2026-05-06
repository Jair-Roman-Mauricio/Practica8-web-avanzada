import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCrudController = (Model, options = {}) => {
  const include = options.include || [];
  const order = options.order || [['createdAt', 'DESC']];

  return {
    listar: asyncHandler(async (_req, res) => {
      const data = await Model.findAll({ include, order });
      res.json(data);
    }),

    obtener: asyncHandler(async (req, res) => {
      const item = await Model.findByPk(req.params.id, { include });
      if (!item) throw new AppError('Recurso no encontrado', 404, 'RESOURCE_NOT_FOUND');
      res.json(item);
    }),

    crear: asyncHandler(async (req, res) => {
      const item = await Model.create(req.validated.body);
      const created = await Model.findByPk(item.id, { include });
      res.status(201).json(created);
    }),

    actualizar: asyncHandler(async (req, res) => {
      const item = await Model.findByPk(req.params.id);
      if (!item) throw new AppError('Recurso no encontrado', 404, 'RESOURCE_NOT_FOUND');
      await item.update(req.validated.body);
      const updated = await Model.findByPk(item.id, { include });
      res.json(updated);
    }),

    eliminar: asyncHandler(async (req, res) => {
      const item = await Model.findByPk(req.params.id);
      if (!item) throw new AppError('Recurso no encontrado', 404, 'RESOURCE_NOT_FOUND');
      await item.destroy();
      res.status(204).send();
    })
  };
};

