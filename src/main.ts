import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configureSwagger } from '@app/common';
declare const module: any;

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const configService = app.get(ConfigService);
  configureSwagger(app, 'mintii');
  await app.listen(configService.get('PORT'));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  logger.log(`🚀 Mintii service running on port ${configService.get('PORT')}`);
}
bootstrap();
