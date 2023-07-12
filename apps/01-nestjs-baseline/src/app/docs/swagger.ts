import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { SWAGGER_CONFIG } from './swagger.config';
import { ConfigService } from '@dev/config';

const SWAGGER_ENVS = ['local', 'development', 'production'];

export function createDocument(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'authorization',
    )
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version);

  SWAGGER_CONFIG.tags.map((tag) => builder.addTag(tag));

  const options = builder.build();

  const env = app.get(ConfigService).get().env;

  const { username, password } = app.get(ConfigService).get().swagger;

  if (SWAGGER_ENVS.includes(env)) {
    app.use(
      'docs',
      basicAuth({
        challenge: true,
        users: { [username]: password },
      }),
    );
  }
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}