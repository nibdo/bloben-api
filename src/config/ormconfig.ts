import { loadEnv } from './env';

const env = loadEnv();

export const createORMConfig = (name?: string): any => {
  return {
    name: name || 'default',
    type: env?.database?.type,
    timezone: 'UTC',
    host: env?.database.host,
    port: Number(env?.database.port),
    username: env?.database.username,
    password: env?.database.password,
    database: env?.database.database,
    logging: false,
    synchronize: false,
    entities: [env?.database.entities],
    migrations: [env.database.migrations],
    runMigrations: false,
  };
};

export default {
  name: 'default',
  type: env?.database?.type,
  timezone: 'UTC',
  database: env?.database.database,
  host: env?.database.host,
  port: Number(env?.database.port),
  username: env?.database.username,
  password: env?.database.password,
  logging: false,
  synchronize: false,
  entities: [env?.database.entities],
  migrations: [env.database.migrations],
};
