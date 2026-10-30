import { Module } from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';

import { UserRepository } from './user.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module( {
  imports: [ PrismaModule ],
  controllers: [],
  providers: [  AuthRepository, UserRepository ],
  exports: [ AuthRepository, UserRepository ]
} )
export class RepositoryModule { }
