import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ExpenseModule } from './expense/expense.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true, // Isso garante que o ConfigModule seja acessível globalmente
    }),
    AuthModule,
    ExpenseModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule {}
