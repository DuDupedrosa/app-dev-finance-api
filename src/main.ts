import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não declaradas no DTO automaticamente
      forbidNonWhitelisted: true, // Retorna erro se propriedades desconhecidas forem enviadas
      transform: true, // Transforma os dados recebidos nos tipos declarados no DTO
    }),
  );

  await app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando na porta 3000');
  });
}
bootstrap();
