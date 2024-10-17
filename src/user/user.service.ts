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
import { AuthService } from 'src/auth/auth.service';
import { ChangePasswordDto } from './dto/changePasswordDto';

@Injectable()
export class UserService {
  private readonly saltRound = 10;
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

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

      const passwordIsValid = await bcrypt.compare(
        userDto.password,
        user.password,
      );

      if (!passwordIsValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'incorrect_password',
        });
      }

      const token = await this.authService.login({
        username: user.name,
        userId: user.id,
        email: user.email,
      });

      let response: UserSigninResponseDto = {
        user: { id: user.id, name: user.name },
        token: token.access_token,
      };

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

      let response: GetUserProfileResponseDto = getUserProfile(updatedUser);

      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, content: response });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.profile|updateUserProfileAsync: ${err.message}`,
      });
    }
  }

  async deleteUserAsync(userId: string, res: Response) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ status: HttpStatus.NOT_FOUND, message: 'user_not_found' });
      }

      await this.prisma.user.delete({
        where: { id: user.id },
      });

      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, content: null });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.service|deleteUserAsync: ${err.message}`,
      });
    }
  }

  async changePasswordAsync(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    res: Response,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ status: HttpStatus.NOT_FOUND, message: 'user_not_found' });
      }

      const passwordCompare = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!passwordCompare) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'incorrect_current_password',
        });
      }

      const hashNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        this.saltRound,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashNewPassword },
      });

      return res
        .status(HttpStatus.OK)
        .json({ status: HttpStatus.OK, content: null });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `user.service|changePasswordAsync: ${err.message}`,
      });
    }
  }
}
