import { createApp } from './app.js';
import { sequelize } from './config/database.js';
import { env } from './config/env.js';
import { syncDatabase } from './models/index.js';

const app = createApp();

try {
  await sequelize.authenticate();
  await syncDatabase();
  app.listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`);
  });
} catch (error) {
  console.error('No se pudo iniciar la API', error);
  process.exit(1);
}

