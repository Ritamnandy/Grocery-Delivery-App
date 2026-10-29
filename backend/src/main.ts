import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';


async function bootstrap ()
{
  const app = await NestFactory.create<NestExpressApplication>( AppModule, { bufferLogs: true } );
  app.set( 'trust proxy', 1 );
  app.use( cookieParser() );
  app.use( compression() );
  app.use( helmet() );
  app.enableCors( {
    origin: process.env.COR_ORIGIN,
    credentials: true,
  } );
  app.useLogger( app.get( Logger ) );
  app.enableShutdownHooks(); // flushes logs on shutdown
  app.setGlobalPrefix( 'api/v1' );
  app.useGlobalPipes(
    new ValidationPipe( {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    } ),
  );
  const port = process.env.PORT ?? 4000;
  await app.listen( port );
  app.get( Logger ).log( `Server running on port ${ port }`, 'Bootstrap' );

}
await bootstrap();
