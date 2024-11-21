import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
    @Body() addExpenseDto: AddExpenseDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    return await this.expenseService.addExpenseAsync(
      addExpenseDto,
      res,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('list-all')
  async listAllExpenses(
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @Query() query: { month: string; maxSize: string },
  ) {
    return await this.expenseService.getAllExpensesAsync(
      res,
      req.user.userId,
      query.month,
      query.maxSize,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param() params: { id: string },
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    return await this.expenseService.deleteAsync(
      Number(params.id),
      res,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('categories')
  async getAllCategories(@Res() res: Response) {
    return await this.expenseService.getExpensesCategoriesAsync(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('total-month/:month')
  async getTotalByMonth(
    @Param() params: { month: string },
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    return await this.expenseService.getTotalByMonthAsync(
      res,
      Number(params.month),
      req.user.userId,
    );
  }
}
