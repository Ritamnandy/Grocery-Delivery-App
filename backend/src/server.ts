

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

export async function bootstrap ( { clustered = false }: { clustered?: boolean } = {} )
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

    const logger = app.get( Logger );
    app.useLogger( logger );

    if ( clustered )
    {
        // The primary orchestrates shutdown. Direct signals are ignored, because Ctrl+C
        // reaches the whole process group and Nest would be hit by two signals at once.
        process.on( 'SIGINT', () => { } );
        process.on( 'SIGTERM', () => { } );
        process.on( 'message', async ( msg ) =>
        {
            if ( msg === 'shutdown' )
            {
                await app.close(); // runs your onModuleDestroy / onApplicationShutdown hooks
                process.exit( 0 );
            }
        } );
    } else
    {
        app.enableShutdownHooks();
    }

    app.setGlobalPrefix( 'api/v1' );
    app.useGlobalPipes(
        new ValidationPipe( { whitelist: true, forbidNonWhitelisted: true, transform: true } ),
    );

    const port = process.env.PORT ?? 4000;
    await app.listen( port );
    logger.log( `Server running on port ${ port } (pid ${ process.pid })`, 'Bootstrap' );
}