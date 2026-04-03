import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env['DATABASE_URL'],
      }),
    });
  }
  async onModuleInit(): Promise<void> {
    console.log('Connecting to database...');
    try {
      await this.$connect();
      console.log('Connected to database');
    } catch (error) {
      console.error('Error connecting to database', error);
      throw error;
    }
  }
  async onModuleDestroy(): Promise<void> {
    console.log('Disconnecting from database...');
    try {
      await this.$disconnect();
      console.log('Disconnected from database');
    } catch (error) {
      console.error('Error disconnecting from database', error);
      throw error;
    }
  }
}
