import { sequelize } from './config/database.js';
import { env } from './config/env.js';
import {
  Especialidad,
  Laboratorio,
  Medicamento,
  TipoMedicamento,
  Usuario,
  syncDatabase
} from './models/index.js';

await sequelize.authenticate();
await syncDatabase();

const [admin] = await Usuario.findOrCreate({
  where: { email: env.adminEmail },
  defaults: {
    nombre: env.adminName,
    email: env.adminEmail,
    password: env.adminPassword,
    rol: 'ADMIN'
  }
});

const [tipo] = await TipoMedicamento.findOrCreate({
  where: { descripcion: 'Analgésico' }
});

const [especialidad] = await Especialidad.findOrCreate({
  where: { descripcion: 'Medicina general' }
});

await Laboratorio.findOrCreate({
  where: { razonSocial: 'Laboratorios Andinos S.A.C.' },
  defaults: {
    direccion: 'Av. Salud 123',
    telefono: '999888777',
    email: 'contacto@labandinos.test',
    contacto: 'María Torres'
  }
});

await Medicamento.findOrCreate({
  where: { descripcionMed: 'Paracetamol 500mg' },
  defaults: {
    fechaFabricacion: '2026-01-10',
    fechaVencimiento: '2028-01-10',
    presentacion: 'Caja x 100 tabletas',
    stock: 100,
    precioVentaUni: 0.5,
    precioVentaPres: 45,
    marca: 'FarmaPlus',
    tipoMedicamentoId: tipo.id,
    especialidadId: especialidad.id
  }
});

console.log(`Seed completo. Admin: ${admin.email}`);
await sequelize.close();

