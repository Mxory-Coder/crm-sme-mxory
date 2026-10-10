import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // needed for webhook signature validation
  });

  // ─── Global validation ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.APP_BASE_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // ─── API versioning ───────────────────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // ─── Swagger ─────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SME Connect API')
      .setDescription('Full GHL-parity CRM with AI — internal API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 SME Connect API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
