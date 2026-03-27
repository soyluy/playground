import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	private readonly prisma: PrismaClie

  constructor() {
    this.prisma = new PrismaClient();
  }
}