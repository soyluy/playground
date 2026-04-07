import { Module } from '@nestjs/common';
import { TodoModule } from '@hub/todo-api';

@Module({
  imports: [TodoModule],
})
export class AppModule {}
