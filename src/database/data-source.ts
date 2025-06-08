import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  // type: 'postgres',
  // host: 'localhost',
  // port: 5432,
  // username: 'postgres',
  // password: '123',
  // database: 'nft-ticket',
  // entities: ['src/**/*.entity.ts'],
  // migrations: [__dirname + '/migrations/*.ts'],
  // synchronize: false,
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
