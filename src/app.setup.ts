import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configurarApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Parqueo Privados GT API')
    .setDescription(
      'API REST protegida con JWT. Inicie sesión en POST /api/auth/login y copie data.accessToken en Authorize → session-jwt, sin escribir Bearer. Conserve el mismo accessToken: la sesión se mantiene automáticamente mientras el login esté vigente. Use data.refreshToken en login-jwt para comprobar/renovar la sesión o cerrarla. La renovación no emite otro token. Si el login vence o se cierra, ambos tokens dejan de permitir acceso.',
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Pegue data.accessToken, sin el prefijo Bearer.',
      },
      'session-jwt',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Pegue data.refreshToken, sin el prefijo Bearer, para mantener/cerrar sesión.',
      },
      'login-jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
