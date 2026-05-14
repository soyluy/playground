import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  name: process.env.DB_NAME ?? 'auction_platform',
  logging: (process.env.DB_LOGGING ?? 'false') === 'true',
  ssl: (process.env.DB_SSL ?? 'false') === 'true',
}));
