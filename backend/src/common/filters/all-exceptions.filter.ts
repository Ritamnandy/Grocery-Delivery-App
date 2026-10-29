
import
  {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter
{
  private readonly logger=new Logger(AllExceptionsFilter.name)

  catch ( exception: unknown, host: ArgumentsHost )
  {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: unknown;

    if ( isHttp )
    {
      const body = exception.getResponse();
      if ( typeof body === 'string' )
      {
        message = body;
      } else
      {
        const b = body as any;
        // class-validator returns message as string[]
        if ( Array.isArray( b.message ) )
        {
          message = 'Validation failed';
          errors = b.message;
        } else
        {
          message = b.message ?? exception.message;
        }
      }
    }

    const requestId = ( req as any ).id;

    // Log full details server-side; 5xx with stack, 4xx as warn
    if ( statusCode >= 500 )
    {
      this.logger.error( { err: exception, requestId, url: req.originalUrl }, 'Unhandled exception' );
    } else
    {
      this.logger.warn( { requestId, statusCode, message, url: req.originalUrl }, 'Handled exception' );
    }

    res.status( statusCode ).json( {
      success: false,
      statusCode,
      message,
      ...( errors ? { errors } : {} ),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      requestId,
    } );
  }
}