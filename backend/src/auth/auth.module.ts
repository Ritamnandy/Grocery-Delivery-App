import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module.js';
import { RoleGuard } from './roleguard/role.guard.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { AuthGuard } from './authguard/auth.guard.js';
import { RepositoryModule } from '../repository/repository.module.js';

@Module( {
  imports: [
    PrismaModule,
    RepositoryModule,
    RedisModule,
    EmailModule,
    PassportModule
  ],
  providers: [ AuthService, AuthGuard, RoleGuard, GoogleStrategy, ],
  controllers: [ AuthController ],
  exports: [ AuthGuard, RoleGuard ]
} )
export class AuthModule { }
