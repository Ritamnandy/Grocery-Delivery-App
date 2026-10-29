

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const IGNORED_PATHS = [ '/health', '/favicon.ico' ];
const SLOW_REQUEST_MS = 1000;

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware
{
  private readonly logger = new Logger( RequestLoggerMiddleware.name );

  use ( req: Request, res: Response, next: NextFunction )
  {
    if ( IGNORED_PATHS.some( ( p ) => req.originalUrl.startsWith( p ) ) )
    {
      return next();
    }

    const start = process.hrtime.bigint();

    const base = {
      requestId: ( req as any ).id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get( 'user-agent' ),
    };

    this.logger.debug( base, 'Incoming request' );

    let finished = false;

    res.on( 'finish', () =>
    {
      finished = true;
      const durationMs = Number( process.hrtime.bigint() - start ) / 1e6;
      const status = res.statusCode;

      const data = {
        ...base,
        statusCode: status,
        durationMs: Math.round( durationMs * 100 ) / 100,
        contentLength: res.get( 'content-length' ),
        // set by your auth guard, which runs after middleware but before 'finish'
        userId: ( req as any ).user?.id ?? ( req as any ).user?._id,
      };

      if ( status >= 500 )
      {
        this.logger.error( data, 'Request failed' );
      } else if ( status >= 400 )
      {
        this.logger.warn( data, 'Request rejected' );
      } else if ( durationMs > SLOW_REQUEST_MS )
      {
        this.logger.warn( data, 'Slow request' );
      } else
      {
        this.logger.log( data, 'Request completed' );
      }
    } );

    // Client disconnected before the response was sent
    res.on( 'close', () =>
    {
      if ( finished ) return;
      const durationMs = Number( process.hrtime.bigint() - start ) / 1e6;
      this.logger.warn(
        { ...base, durationMs: Math.round( durationMs * 100 ) / 100 },
        'Request aborted by client',
      );
    } );

    next();
  }
}