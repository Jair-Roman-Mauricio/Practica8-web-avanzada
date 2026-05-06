import { sequelize } from '../config/database.js';
import {
  DetalleOrdenCompra,
  DetalleOrdenVenta,
  Laboratorio,
  Medicamento,
  OrdenCompra,
  OrdenVenta
} from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const compraIncludes = [
  { model: Laboratorio },
  { model: DetalleOrdenCompra, as: 'detalles', include: [Medicamento] }
];

const ventaIncludes = [
  { model: DetalleOrdenVenta, as: 'detalles', include: [Medicamento] }
];

export const listarCompras = () => OrdenCompra.findAll({
  include: compraIncludes,
  order: [['createdAt', 'DESC']]
});

export const obtenerCompra = async (id) => {
  const compra = await OrdenCompra.findByPk(id, { include: compraIncludes });
  if (!compra) throw new AppError('Compra no encontrada', 404, 'PURCHASE_NOT_FOUND');
  return compra;
};

export const registrarCompra = async (payload) => sequelize.transaction(async (transaction) => {
  const laboratorio = await Laboratorio.findByPk(payload.laboratorioId, { transaction });
  if (!laboratorio) throw new AppError('Laboratorio no encontrado', 404, 'LAB_NOT_FOUND');

  let total = 0;
  const detallesPreparados = [];

  for (const item of payload.detalles) {
    const medicamento = await Medicamento.findByPk(item.medicamentoId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!medicamento) throw new AppError(`Medicamento ${item.medicamentoId} no encontrado`, 404, 'MEDICINE_NOT_FOUND');

    const montoUni = Number(item.cantidad) * Number(item.precio);
    total += montoUni;
    detallesPreparados.push({
      medicamento,
      detalle: {
        medicamentoId: medicamento.id,
        descripcion: item.descripcion || medicamento.descripcionMed,
        cantidad: item.cantidad,
        precio: item.precio,
        montoUni
      }
    });
  }

  const compra = await OrdenCompra.create({
    fechaEmision: payload.fechaEmision,
    situacion: payload.situacion || 'REGISTRADA',
    laboratorioId: payload.laboratorioId,
    nroFacturaProv: payload.nroFacturaProv,
    total
  }, { transaction });

  for (const item of detallesPreparados) {
    await DetalleOrdenCompra.create({ ...item.detalle, ordenCompraId: compra.id }, { transaction });
    await item.medicamento.increment('stock', { by: item.detalle.cantidad, transaction });
  }

  return OrdenCompra.findByPk(compra.id, { include: compraIncludes, transaction });
});

export const listarVentas = () => OrdenVenta.findAll({
  include: ventaIncludes,
  order: [['createdAt', 'DESC']]
});

export const obtenerVenta = async (id) => {
  const venta = await OrdenVenta.findByPk(id, { include: ventaIncludes });
  if (!venta) throw new AppError('Venta no encontrada', 404, 'SALE_NOT_FOUND');
  return venta;
};

export const registrarVenta = async (payload) => sequelize.transaction(async (transaction) => {
  let total = 0;
  const detallesPreparados = [];

  for (const item of payload.detalles) {
    const medicamento = await Medicamento.findByPk(item.medicamentoId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!medicamento) throw new AppError(`Medicamento ${item.medicamentoId} no encontrado`, 404, 'MEDICINE_NOT_FOUND');
    if (medicamento.stock < item.cantidadRequerida) {
      throw new AppError(`Stock insuficiente para ${medicamento.descripcionMed}`, 422, 'INSUFFICIENT_STOCK');
    }

    const precioUnitario = Number(medicamento.precioVentaUni);
    const subtotal = precioUnitario * Number(item.cantidadRequerida);
    total += subtotal;
    detallesPreparados.push({
      medicamento,
      detalle: {
        medicamentoId: medicamento.id,
        descripcionMed: medicamento.descripcionMed,
        cantidadRequerida: item.cantidadRequerida,
        precioUnitario,
        subtotal
      }
    });
  }

  const venta = await OrdenVenta.create({
    fechaEmision: payload.fechaEmision,
    motivo: payload.motivo,
    situacion: payload.situacion || 'REGISTRADA',
    total
  }, { transaction });

  for (const item of detallesPreparados) {
    await DetalleOrdenVenta.create({ ...item.detalle, ordenVentaId: venta.id }, { transaction });
    await item.medicamento.decrement('stock', { by: item.detalle.cantidadRequerida, transaction });
  }

  return OrdenVenta.findByPk(venta.id, { include: ventaIncludes, transaction });
});
