import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer()
  // The timeout value for sockets
  // server.setTimeout(5 * 60 * 1000)
  // The number of milliseconds of inactivity a server needs to wait for additional incoming data
  // server.keepAliveTimeout = 30000
  // Limit the amount of time the parser will wait to receive the complete HTTP headers
  // server.headersTimeout = 5 * 60 * 1000
  await app.listen(process.env.PROT);
}
bootstrap();
