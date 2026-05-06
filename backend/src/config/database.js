import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const sequelize = env.dbDialect === 'sqlite'
  ? new Sequelize({ dialect: 'sqlite', storage: env.dbStorage, logging: false })
  : new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
      host: env.dbHost,
      port: env.dbPort,
      dialect: 'postgres',
      logging: false,
      dialectOptions: env.dbSsl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
    });
