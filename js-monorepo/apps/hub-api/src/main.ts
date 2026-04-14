import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import 'dotenv/config';
import { DEV_CORS_ORIGIN, PROD_CORS_ORIGIN } from './constants/cors.constants';
import session from 'express-session';
import passport from 'passport';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Port
  const port = process.env.PORT || 3000;

  // CORS
  const corsOrigin =
    process.env.ENV === 'development' ? DEV_CORS_ORIGIN : PROD_CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Session
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const postgresSession = pgSession(session);
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set');
  }
  app.use(
    session({
      store: new postgresSession({
        pool: pgPool,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      },
    }),
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
    }),
  );

  // Listen
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
