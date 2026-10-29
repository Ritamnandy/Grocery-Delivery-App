import { Module, type MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';

import { AuthModule } from './auth/auth.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { ConfigModule } from '@nestjs/config';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { RedisModule } from './redis/redis.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisService } from './redis/redis.service.js';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from './email/email.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ImageModule } from './image/image.module.js';
import { AppController } from './app.controller.js';


@Module( {
  imports: [
    ConfigModule.forRoot( {
      isGlobal: true,
    } ),
    JwtModule.register( {
      global: true,
    } ),
    ThrottlerModule.forRoot( {
      throttlers: [
        {
          name: "default",
          ttl: 60000,
          limit: 110,
        },

      ],
      errorMessage: 'Too many requests. Please try again later.',
    } ),
    AuthModule,
    LoggerModule,
    RedisModule,
    BullModule.forRootAsync( {
      imports: [ RedisModule ],
      useFactory: ( redis: RedisService ) => ( {
        connection: redis.getClient()
      } ),
      inject: [ RedisService ],
    } ),
    EmailModule,
    PrismaModule,
    ImageModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
  controllers: [AppController],
} )
export class AppModule implements NestModule
{
  configure ( consumer: MiddlewareConsumer )
  {
    consumer.apply( RequestLoggerMiddleware ).forRoutes( { path: '*path', method: RequestMethod.ALL } );
  }
}
