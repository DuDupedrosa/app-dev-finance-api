import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/registerUserDto';
import { Response } from 'express';
import { userSigninDto } from './dto/userSigninDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async Register(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    return await this.userService.registerAsync(registerUserDto, res);
  }

  @Post('signin')
  async Signin(@Body() userSigninDto: userSigninDto, @Res() res: Response) {
    return await this.userService.signinAsync(userSigninDto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async GetUserProfile(@Param() params: { id: string }, @Res() res: Response) {
    return await this.userService.getUserProfileAsync(params.id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async UpdateUser(@Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    return await this.userService.updateUserProfileAsync(updateUserDto, res);
  }
}
