import request from 'supertest';
import { createApp } from '../src/app.js';
import { sequelize } from '../src/config/database.js';
import {
  Especialidad,
  Laboratorio,
  Medicamento,
  TipoMedicamento,
  Usuario,
  syncDatabase
} from '../src/models/index.js';

const app = createApp();

const login = async (email, password = 'Password123') => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return response.body.token;
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const seedBase = async () => {
  await syncDatabase({ force: true });

  await Promise.all([
    Usuario.create({ nombre: 'Admin', email: 'admin@test.com', password: 'Password123', rol: 'ADMIN' }),
    Usuario.create({ nombre: 'Venta', email: 'venta@test.com', password: 'Password123', rol: 'VENDEDOR' }),
    Usuario.create({ nombre: 'Almacen', email: 'almacen@test.com', password: 'Password123', rol: 'ALMACEN' })
  ]);

  const tipo = await TipoMedicamento.create({ descripcion: 'Analgésico' });
  const especialidad = await Especialidad.create({ descripcion: 'General' });
  const laboratorio = await Laboratorio.create({
    razonSocial: 'Lab Uno',
    direccion: 'Av. Uno 123',
    telefono: '999999999',
    email: 'lab@test.com',
    contacto: 'Contacto'
  });
  const medicamento = await Medicamento.create({
    descripcionMed: 'Ibuprofeno 400mg',
    fechaFabricacion: '2026-01-01',
    fechaVencimiento: '2028-01-01',
    presentacion: 'Caja',
    stock: 5,
    precioVentaUni: 2,
    precioVentaPres: 20,
    marca: 'Marca',
    tipoMedicamentoId: tipo.id,
    especialidadId: especialidad.id
  });

  return { tipo, especialidad, laboratorio, medicamento };
};

beforeEach(async () => {
  await seedBase();
});

afterAll(async () => {
  await sequelize.close();
});

test('evita registro de usuarios duplicados', async () => {
  const first = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Nuevo', email: 'nuevo@test.com', password: 'Password123', rol: 'VENDEDOR' });

  const duplicated = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Nuevo', email: 'nuevo@test.com', password: 'Password123', rol: 'VENDEDOR' });

  expect(first.status).toBe(201);
  expect(duplicated.status).toBe(409);
});

test('login inválido devuelve 401', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'mal' });

  expect(response.status).toBe(401);
});

test('protege rutas sin token y bloquea roles incorrectos', async () => {
  const vendedorToken = await login('venta@test.com');
  const almacenToken = await login('almacen@test.com');

  const sinToken = await request(app).get('/api/medicamentos');
  const sinRol = await request(app)
    .post('/api/compras')
    .set(auth(vendedorToken))
    .send({});
  const ventaBloqueada = await request(app)
    .get('/api/ventas')
    .set(auth(almacenToken));
  const medicamentoBloqueado = await request(app)
    .post('/api/medicamentos')
    .set(auth(almacenToken))
    .send({
      descripcionMed: 'Nuevo',
      fechaFabricacion: '2026-01-01',
      fechaVencimiento: '2028-01-01',
      presentacion: 'Caja',
      stock: 1,
      precioVentaUni: 1,
      precioVentaPres: 10,
      marca: 'Marca',
      tipoMedicamentoId: 1,
      especialidadId: 1
    });

  expect(sinToken.status).toBe(401);
  expect(sinRol.status).toBe(403);
  expect(ventaBloqueada.status).toBe(403);
  expect(medicamentoBloqueado.status).toBe(403);
});

test('compra registra detalle e incrementa stock', async () => {
  const token = await login('almacen@test.com');
  const medicamentoAntes = await Medicamento.findOne();
  const laboratorio = await Laboratorio.findOne();

  const response = await request(app)
    .post('/api/compras')
    .set(auth(token))
    .send({
      fechaEmision: '2026-05-04',
      laboratorioId: laboratorio.id,
      nroFacturaProv: 'F001-99',
      detalles: [{ medicamentoId: medicamentoAntes.id, cantidad: 7, precio: 1.5 }]
    });

  const medicamentoDespues = await Medicamento.findByPk(medicamentoAntes.id);

  expect(response.status).toBe(201);
  expect(response.body.detalles).toHaveLength(1);
  expect(medicamentoDespues.stock).toBe(12);
});

test('venta sin stock devuelve 422 y no modifica inventario', async () => {
  const token = await login('venta@test.com');
  const medicamento = await Medicamento.findOne();

  const response = await request(app)
    .post('/api/ventas')
    .set(auth(token))
    .send({
      fechaEmision: '2026-05-04',
      motivo: 'Mostrador',
      detalles: [{ medicamentoId: medicamento.id, cantidadRequerida: 99 }]
    });

  const actualizado = await Medicamento.findByPk(medicamento.id);

  expect(response.status).toBe(422);
  expect(actualizado.stock).toBe(5);
});

test('venta válida descuenta stock', async () => {
  const token = await login('venta@test.com');
  const medicamento = await Medicamento.findOne();

  const response = await request(app)
    .post('/api/ventas')
    .set(auth(token))
    .send({
      fechaEmision: '2026-05-04',
      motivo: 'Mostrador',
      detalles: [{ medicamentoId: medicamento.id, cantidadRequerida: 3 }]
    });

  const actualizado = await Medicamento.findByPk(medicamento.id);

  expect(response.status).toBe(201);
  expect(response.body.detalles).toHaveLength(1);
  expect(actualizado.stock).toBe(2);
});

test('valida datos obligatorios', async () => {
  const token = await login('admin@test.com');
  const response = await request(app)
    .post('/api/medicamentos')
    .set(auth(token))
    .send({ descripcionMed: '' });

  expect(response.status).toBe(400);
});
