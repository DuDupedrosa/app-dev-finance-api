import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddExpenseDto {
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsNotEmpty()
  expenseValue: number;
}
