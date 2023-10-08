import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: any, name: string): void {
  const options = new DocumentBuilder()
    .setTitle(`${name} api`)
    .setDescription(`The ${name} API description`)
    .setVersion('1.0')
    .addTag(name)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
