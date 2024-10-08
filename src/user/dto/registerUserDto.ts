import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'name_required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'email_required' })
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'password_required' })
  @IsString()
  @MinLength(6, { message: 'required_min_length' })
  @Matches(/(?=.*[A-Z])/, { message: 'required_one_uppercase' })
  @Matches(/(?=.*[a-z])/, { message: 'required_one_lowercase' })
  @Matches(/(?=.*\d)/, { message: 'required_one_number' })
  @Matches(/(?=.*\W)/, { message: 'required_one_special' })
  password: string;
}
