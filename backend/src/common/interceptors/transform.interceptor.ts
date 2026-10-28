// src/common/interceptors/transform.interceptor.ts
import
  {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    StreamableFile,
  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from '../../utils/app.utils.js';


export interface ApiResponse<T>
{
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;
  timestamp: string;
  path: string;
  requestId?: string;
}

const DEFAULT_MESSAGES: Record<string, string> = {
  GET: 'Fetched successfully',
  POST: 'Created successfully',
  PUT: 'Updated successfully',
  PATCH: 'Updated successfully',
  DELETE: 'Deleted successfully',
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | T>
{
  constructor ( private readonly reflector: Reflector ) { }

  intercept ( context: ExecutionContext, next: CallHandler ): Observable<ApiResponse<T> | T>
  {
    if ( context.getType() !== 'http' ) return next.handle();

    const skip = this.reflector.getAllAndOverride<boolean>( SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ] );
    if ( skip ) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const customMessage = this.reflector.getAllAndOverride<string>( RESPONSE_MESSAGE_KEY, [
      context.getHandler(),
      context.getClass(),
    ] );

    return next.handle().pipe(
      map( ( payload ) =>
      {
        // Don't wrap files or streams
        if ( payload instanceof StreamableFile || res.headersSent ) return payload;

        const statusCode = res.statusCode;
        let data: any = payload ?? null;
        let meta: Record<string, unknown> | undefined;
        let message = customMessage ?? DEFAULT_MESSAGES[ req.method ] ?? 'Success';

        // Paginated result: return { data: [...], meta: {...} } from your service
        if ( payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload )
        {
          data = ( payload as any ).data;
          meta = ( payload as any ).meta;
        }
        // Handler wants to set the message itself: return { message, data }
        else if ( payload && typeof payload === 'object' && 'message' in payload && 'data' in payload )
        {
          message = ( payload as any ).message;
          data = ( payload as any ).data;
        }

        return {
          success: true,
          statusCode,
          message,
          data,
          ...( meta && { meta } ),
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          requestId: ( req as any ).id,
        };
      } ),
    );
  }
}