
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger as PinoLogger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { availableParallelism } from 'node:os';
import { runPrimary } from './workers.js'
import cluster from 'node:cluster';
import { isProduction, nestLogLevels } from './logger/logger.config.js';


async function bootstrap ()
{
  const prod = isProduction();
  const app = await NestFactory.create<NestExpressApplication>( AppModule, {
    bufferLogs: prod, // only buffer when pino will take over
    logger: prod ? undefined : nestLogLevels( process.env.LOG_LEVEL ?? 'debug' ),
  } );
  app.set( 'trust proxy', 1 );
  app.use( cookieParser() );
  app.use( compression() );
  app.use( helmet() );
  app.enableCors( {
    origin: process.env.COR_ORIGIN,
    credentials: true,
  } );
  if ( prod )
  {
    app.useLogger( app.get( PinoLogger ) ); // pino replaces Nest's logger
  }
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
  // Nest's Logger works in both envs (pino-backed in prod via useLogger)
  new Logger( 'Bootstrap' ).log( `Server running on port ${ port } (pid ${ process.pid })` );
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