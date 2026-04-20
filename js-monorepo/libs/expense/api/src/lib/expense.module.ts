import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { PrismaModule } from '@hub/prisma';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [PrismaModule],
})
export class ExpenseModule {}
