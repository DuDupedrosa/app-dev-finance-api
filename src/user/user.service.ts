import { HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/registerUserDto';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDataDto } from './dto/registerUserDataDto';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { userSigninDto } from './dto/userSigninDto';
import { UserSigninResponseDto } from './dto/userSigninResponseDto';
import { getUserProfile } from 'src/helpers/mappings/user/user';
import { GetUserProfileResponseDto } from 'src/helpers/mappings/user/types';
import { UpdateUserDto } from './dto/updateUserDto';

@Injectable()
export class UserService {
  private readonly saltRound = 10;
  constructor(private prisma: PrismaService) {}

  async registerAsync(user: RegisterUserDto, res: Response) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, this.saltRound);
      let payload: RegisterUserDataDto = { ...user, id: uuidv4() };
      payload.password = hashedPassword;

      const newUser = await this.prisma.user.create({
        data: { ...payload },
      });

      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        content: { id: newUser.id },
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.service|registerAsync: ${err.message}`,
      });
    }
  }

  async signinAsync(userDto: userSigninDto, res: Response) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: userDto.email },
      });

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: HttpStatus.NOT_FOUND,
          message: `email_not_registered`,
        });
      }

      const passwordIsValid = bcrypt.compareSync(
        userDto.password,
        user.password,
      );

      if (!passwordIsValid) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: HttpStatus.NOT_FOUND,
          message: 'incorrect_password',
        });
      }

      let response: GetUserProfileResponseDto = getUserProfile(user);

      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, content: response });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.service|signinAsync: ${err.message}`,
      });
    }
  }

  async getUserProfileAsync(userId: string, res: Response) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ status: HttpStatus.NOT_FOUND, message: 'not_found_user' });
      }

      let response: GetUserProfileResponseDto = getUserProfile(user);

      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, content: response });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.service|getUserProfileAsync: ${err.message}`,
      });
    }
  }

  async updateUserProfileAsync(updateUserDto: UpdateUserDto, res: Response) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: updateUserDto.id },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ status: HttpStatus.NOT_FOUND, message: 'user_not_found' });
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: updateUserDto.id },
        data: { ...updateUserDto },
      });

      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, content: { id: updatedUser.id } });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.profile|updateUserProfileAsync: ${err.message}`,
      });
    }
  }
}
