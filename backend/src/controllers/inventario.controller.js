import {
  listarCompras,
  listarVentas,
  obtenerCompra,
  obtenerVenta,
  registrarCompra,
  registrarVenta
} from '../services/inventario.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const comprasIndex = asyncHandler(async (_req, res) => {
  res.json(await listarCompras());
});

export const comprasShow = asyncHandler(async (req, res) => {
  res.json(await obtenerCompra(req.params.id));
});

export const comprasStore = asyncHandler(async (req, res) => {
  res.status(201).json(await registrarCompra(req.validated.body));
});

export const ventasIndex = asyncHandler(async (_req, res) => {
  res.json(await listarVentas());
});

export const ventasShow = asyncHandler(async (req, res) => {
  res.json(await obtenerVenta(req.params.id));
});

export const ventasStore = asyncHandler(async (req, res) => {
  res.status(201).json(await registrarVenta(req.validated.body));
});

