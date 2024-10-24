import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { AddExpenseDto } from './dto/addExpenseDto';
import { Response } from 'express';
import { RequestWithUser } from 'src/helpers/types/request';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('expense')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    addExpenseDto: AddExpenseDto,
    res: Response,
    req: RequestWithUser,
  ) {
    return await this.expenseService.addExpenseAsync(
      addExpenseDto,
      res,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param() params: { id: number },
    res: Response,
    req: RequestWithUser,
  ) {
    return await this.expenseService.deleteAsync(
      params.id,
      res,
      req.user.userId,
    );
  }
}
