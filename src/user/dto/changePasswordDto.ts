import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'currentPassword_required' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'newPassword_required' })
  @IsString()
  @MinLength(6, { message: 'required_min_length' })
  @Matches(/(?=.*[A-Z])/, { message: 'required_one_uppercase' })
  @Matches(/(?=.*[a-z])/, { message: 'required_one_lowercase' })
  @Matches(/(?=.*\d)/, { message: 'required_one_number' })
  @Matches(/(?=.*\W)/, { message: 'required_one_special' })
  newPassword: string;
}
