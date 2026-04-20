import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

@Controller('expense')
export class ExpenseController {
  @Get()
  getExpenses() {
    return 'Hello World';
  }

	@Get(':id')
	getExpense(@Param('id') id: string) {
		return 'Hello World';
	}	

	@Post()
	createExpense(@Body() createExpenseDto: CreateExpenseDto) {
		return 'Hello World';
	}

	@Put(':id')
	updateExpense(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
		return 'Hello World';
	}

	@Delete(':id')
	deleteExpense(@Param('id') id: string) {
		return 'Hello World';
	}
}
