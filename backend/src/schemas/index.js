import { z } from 'zod';
import { ROLES } from '../models/index.js';

const id = z.coerce.number().int().positive();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe usar formato YYYY-MM-DD');

export const idParamSchema = z.object({ params: z.object({ id }) });

export const registerSchema = z.object({
  body: z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    rol: z.enum(ROLES).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const usuarioSchema = z.object({
  body: z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8).optional(),
    rol: z.enum(ROLES),
    activo: z.boolean().optional()
  })
});

export const catalogoSchema = z.object({
  body: z.object({ descripcion: z.string().min(2) })
});

export const laboratorioSchema = z.object({
  body: z.object({
    razonSocial: z.string().min(2),
    direccion: z.string().min(2),
    telefono: z.string().min(4),
    email: z.string().email(),
    contacto: z.string().min(2)
  })
});

export const medicamentoSchema = z.object({
  body: z.object({
    descripcionMed: z.string().min(2),
    fechaFabricacion: date,
    fechaVencimiento: date,
    presentacion: z.string().min(2),
    stock: z.coerce.number().int().min(0).optional(),
    precioVentaUni: z.coerce.number().min(0),
    precioVentaPres: z.coerce.number().min(0),
    marca: z.string().min(2),
    tipoMedicamentoId: id,
    especialidadId: id
  })
});

const detalleCompra = z.object({
  medicamentoId: id,
  descripcion: z.string().min(2).optional(),
  cantidad: z.coerce.number().int().positive(),
  precio: z.coerce.number().min(0)
});

export const compraSchema = z.object({
  body: z.object({
    fechaEmision: date,
    situacion: z.string().min(2).optional(),
    laboratorioId: id,
    nroFacturaProv: z.string().min(2),
    detalles: z.array(detalleCompra).min(1)
  })
});

const detalleVenta = z.object({
  medicamentoId: id,
  cantidadRequerida: z.coerce.number().int().positive()
});

export const ventaSchema = z.object({
  body: z.object({
    fechaEmision: date,
    motivo: z.string().min(2),
    situacion: z.string().min(2).optional(),
    detalles: z.array(detalleVenta).min(1)
  })
});

