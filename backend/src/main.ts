
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { availableParallelism } from 'node:os';
import { runPrimary } from './workers.js'
import cluster from 'node:cluster';


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
  app.enableShutdownHooks(); // flushes logs and closes connections on SIGTERM
  app.setGlobalPrefix( 'api/v1' );
  app.useGlobalPipes(
    new ValidationPipe( {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    } ),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen( port );
  app.get( Logger ).log( `Server running on port ${ port } (pid ${ process.pid })`, 'Bootstrap' );
}


const isProd = process.env.NODE_ENV === 'production';
const workerCount =
  Number.parseInt( process.env.WEB_CONCURRENCY ?? '', 10 ) || ( isProd ? availableParallelism() : 1 );

if ( cluster.isPrimary && workerCount > 1 )
{
  runPrimary( workerCount );
} else
{
  await bootstrap();
}