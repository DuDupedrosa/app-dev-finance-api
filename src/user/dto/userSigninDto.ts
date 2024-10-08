import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class userSigninDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email_required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password_required' })
  password: string;
}
