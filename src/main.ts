import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    morgan((tokens, req, res) =>
      [
        tokens['remote-addr'](req, res),
        tokens.date(req, res, 'clf'),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        tokens.referrer(req, res),
        tokens['user-agent'](req, res),
        '-',
        (req as any).user ? (req as any).user.clientId : 'no_user',
        '-',
        tokens['response-time'](req, res),
        'ms',
      ].join(' '),
    ),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
