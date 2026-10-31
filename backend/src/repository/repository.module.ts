import { Module } from '@nestjs/common';
import { AuthRepository } from './auth.repository.js';
import { UserRepository } from './user.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AddressRepository } from './address.repository.js';
import { ProductsRepository } from './products.repository.js';

@Module( {
  imports: [ PrismaModule ],
  controllers: [],
  providers: [  AuthRepository, UserRepository, AddressRepository,ProductsRepository ],
  exports: [ AuthRepository, UserRepository, AddressRepository,ProductsRepository ]
} )
export class RepositoryModule { }
