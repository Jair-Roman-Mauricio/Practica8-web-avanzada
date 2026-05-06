import bcrypt from 'bcryptjs';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ROLES = ['ADMIN', 'VENDEDOR', 'ALMACEN'];

export const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.VIRTUAL },
  rol: { type: DataTypes.ENUM(...ROLES), allowNull: false, defaultValue: 'VENDEDOR' },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeValidate: async (usuario) => {
      if (usuario.password) {
        usuario.passwordHash = await bcrypt.hash(usuario.password, 10);
      }
    }
  }
});

Usuario.prototype.validarPassword = function validarPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

Usuario.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.passwordHash;
  delete values.password;
  return values;
};

export const Laboratorio = sequelize.define('Laboratorio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  razonSocial: { type: DataTypes.STRING(180), allowNull: false },
  direccion: { type: DataTypes.STRING(220), allowNull: false },
  telefono: { type: DataTypes.STRING(40), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, validate: { isEmail: true } },
  contacto: { type: DataTypes.STRING(120), allowNull: false }
}, { tableName: 'laboratorios' });

export const TipoMedicamento = sequelize.define('TipoMedicamento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING(120), allowNull: false, unique: true }
}, { tableName: 'tipos_medicamento' });

export const Especialidad = sequelize.define('Especialidad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING(120), allowNull: false, unique: true }
}, { tableName: 'especialidades' });

export const Medicamento = sequelize.define('Medicamento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcionMed: { type: DataTypes.STRING(180), allowNull: false },
  fechaFabricacion: { type: DataTypes.DATEONLY, allowNull: false },
  fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: false },
  presentacion: { type: DataTypes.STRING(120), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  precioVentaUni: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  precioVentaPres: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  marca: { type: DataTypes.STRING(120), allowNull: false }
}, {
  tableName: 'medicamentos',
  indexes: [{ fields: ['descripcionMed'] }]
});

export const OrdenCompra = sequelize.define('OrdenCompra', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fechaEmision: { type: DataTypes.DATEONLY, allowNull: false },
  situacion: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'REGISTRADA' },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  nroFacturaProv: { type: DataTypes.STRING(80), allowNull: false }
}, { tableName: 'ordenes_compra' });

export const DetalleOrdenCompra = sequelize.define('DetalleOrdenCompra', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING(180), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  montoUni: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 }
}, { tableName: 'detalles_orden_compra' });

export const OrdenVenta = sequelize.define('OrdenVenta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fechaEmision: { type: DataTypes.DATEONLY, allowNull: false },
  motivo: { type: DataTypes.STRING(160), allowNull: false },
  situacion: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'REGISTRADA' },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 }
}, { tableName: 'ordenes_venta' });

export const DetalleOrdenVenta = sequelize.define('DetalleOrdenVenta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcionMed: { type: DataTypes.STRING(180), allowNull: false },
  cantidadRequerida: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 }
}, { tableName: 'detalles_orden_venta' });

TipoMedicamento.hasMany(Medicamento, { foreignKey: { name: 'tipoMedicamentoId', allowNull: false } });
Medicamento.belongsTo(TipoMedicamento, { foreignKey: { name: 'tipoMedicamentoId', allowNull: false } });

Especialidad.hasMany(Medicamento, { foreignKey: { name: 'especialidadId', allowNull: false } });
Medicamento.belongsTo(Especialidad, { foreignKey: { name: 'especialidadId', allowNull: false } });

Laboratorio.hasMany(OrdenCompra, { foreignKey: { name: 'laboratorioId', allowNull: false } });
OrdenCompra.belongsTo(Laboratorio, { foreignKey: { name: 'laboratorioId', allowNull: false } });

OrdenCompra.hasMany(DetalleOrdenCompra, {
  as: 'detalles',
  foreignKey: { name: 'ordenCompraId', allowNull: false },
  onDelete: 'CASCADE'
});
DetalleOrdenCompra.belongsTo(OrdenCompra, { foreignKey: { name: 'ordenCompraId', allowNull: false } });

Medicamento.hasMany(DetalleOrdenCompra, { foreignKey: { name: 'medicamentoId', allowNull: false } });
DetalleOrdenCompra.belongsTo(Medicamento, { foreignKey: { name: 'medicamentoId', allowNull: false } });

OrdenVenta.hasMany(DetalleOrdenVenta, {
  as: 'detalles',
  foreignKey: { name: 'ordenVentaId', allowNull: false },
  onDelete: 'CASCADE'
});
DetalleOrdenVenta.belongsTo(OrdenVenta, { foreignKey: { name: 'ordenVentaId', allowNull: false } });

Medicamento.hasMany(DetalleOrdenVenta, { foreignKey: { name: 'medicamentoId', allowNull: false } });
DetalleOrdenVenta.belongsTo(Medicamento, { foreignKey: { name: 'medicamentoId', allowNull: false } });

export const syncDatabase = async ({ force = false } = {}) => {
  await sequelize.sync({ force });
};

export const models = {
  Usuario,
  Laboratorio,
  TipoMedicamento,
  Especialidad,
  Medicamento,
  OrdenCompra,
  DetalleOrdenCompra,
  OrdenVenta,
  DetalleOrdenVenta
};
