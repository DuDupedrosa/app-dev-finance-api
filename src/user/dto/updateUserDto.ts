import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'name_required' })
  name: string;

  @IsString()
  @IsOptional()
  lastName: string | null;

  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'email_required' })
  email: string;

  @IsString()
  @IsOptional()
  cellphone: string | null;

  @IsString()
  @IsNotEmpty({ message: 'userId_required' })
  id: string;
}
