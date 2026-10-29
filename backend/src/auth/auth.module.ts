import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from '../repository/auth.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module.js';
import { RoleGuard } from './roleguard/role.guard.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { AuthGuard } from './authguard/auth.guard.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RepositoryModule } from '../repository/repository.module.js';

@Module( {
  imports: [
    PrismaModule,
    RepositoryModule,
    RedisModule,
    EmailModule,
    PassportModule
  ],
  providers: [ AuthService, AuthGuard, AuthRepository, RoleGuard, GoogleStrategy, ],
  controllers: [ AuthController ],
  exports: [ AuthGuard, RoleGuard ]
} )
export class AuthModule { }
