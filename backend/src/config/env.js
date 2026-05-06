import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  dbDialect: process.env.DB_DIALECT || 'postgres',
  dbStorage: process.env.DB_STORAGE || ':memory:',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || 'farmacia',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || '12345',
  dbSsl: process.env.DB_SSL === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  adminName: process.env.ADMIN_NAME || 'Administrador',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@farmacia.test',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin12345'
};
