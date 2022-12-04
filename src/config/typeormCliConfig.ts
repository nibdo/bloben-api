import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const dataSource = new DataSource({
  name: 'cli',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: false,
  synchronize: false,
  entities: [process.env.DB_ENTITIES],
  migrations: [process.env.DB_MIGRATIONS],
});
