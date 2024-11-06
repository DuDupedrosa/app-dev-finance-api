import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddExpenseDto } from './dto/addExpenseDto';
import { Response } from 'express';
import categories from 'src/helpers/data/categories';
import { getMonth, parseISO } from 'date-fns';

@Injectable()
export class ExpenseService {
  constructor(private prismaService: PrismaService) {}

  async addExpenseAsync(
    addExpenseDto: AddExpenseDto,
    res: Response,
    userId: string,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user', status: HttpStatus.NOT_FOUND });
      }

      const category = categories.find(
        (category) => category.id === addExpenseDto.categoryId,
      );

      if (!category) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'not_found_category_by_category_id',
          status: HttpStatus.NOT_FOUND,
        });
      }

      // yyyy-MM-dd - vem do front
      // HH:mm - vem do front
      const { categoryId, expenseValue, time, date } = addExpenseDto;
      // da o parseISO
      const dateTimeString = `${date}T${time}:00`;
      // gera a data a partir do parseISO
      const expenseDate = parseISO(dateTimeString);
      const expenseDateUTC = expenseDate.toISOString();

      let expenseToSave: {
        value: number;
        date: string;
        categoryId: number;
        userId: string;
      } = {
        value: expenseValue,
        categoryId: categoryId,
        date: expenseDateUTC,
        userId,
      };

      const { id } = await this.prismaService.expense.create({
        data: expenseToSave,
      });

      return res
        .status(HttpStatus.CREATED)
        .json({ content: id, status: HttpStatus.CREATED });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `expense.service|addExpenseAsync: ${err.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async deleteAsync(id: number, res: Response, userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user', status: HttpStatus.NOT_FOUND });
      }

      const expense = await this.prismaService.expense.findUnique({
        where: { id },
      });

      if (!expense) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'not_found_expense_id',
          status: HttpStatus.NOT_FOUND,
        });
      }

      if (expense.userId !== userId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'user_not_allowed_to_delete_expense',
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      await this.prismaService.expense.delete({ where: { id, userId } });

      return res
        .status(HttpStatus.OK)
        .json({ content: '', status: HttpStatus.OK });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `expense.service|deleteAsync: ${err.message}`,
      });
    }
  }

  async getAllExpensesAsync(
    res: Response,
    userId: string,
    month?: string,
    maxSize?: string,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user', status: HttpStatus.NOT_FOUND });
      }

      if (month && month.length) {
        const monthNumber = Number(month);

        if (isNaN(monthNumber) || monthNumber < 0 || monthNumber > 11)
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: 'invalid_month', status: HttpStatus.BAD_REQUEST });
      }

      if (maxSize && maxSize.length) {
        const numberMaxSize = Number(maxSize);

        if (isNaN(numberMaxSize)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'invalid_max_size',
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }

      const expenses = await this.prismaService.expense.findMany({
        where: { userId },
      });
      let filteredExpenses = month
        ? expenses.filter((expense) => getMonth(expense.date) === Number(month))
        : expenses;

      if (maxSize && maxSize.length) {
        filteredExpenses = filteredExpenses.slice(0, Number(maxSize));
      }

      return res.status(HttpStatus.OK).json({
        content: filteredExpenses,
        status: HttpStatus.OK,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `expense.service|getAllExpensesByMonthAsync: ${err.message}`,
      });
    }
  }

  async getExpensesCategoriesAsync(res: Response) {
    try {
      return res
        .status(HttpStatus.OK)
        .json({ content: categories, status: HttpStatus.OK });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `expense.service|getExpensesCategoriesAsync: ${err.message}`,
      });
    }
  }
}
