import { Module } from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, AuthRepository],
  exports: [AuthRepository]
})
export class RepositoryModule {}
