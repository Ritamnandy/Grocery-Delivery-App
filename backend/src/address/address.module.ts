import { Module } from '@nestjs/common';
import { AddressService } from './address.service.js';
import { AddressController } from './address.controller.js';
import { RepositoryModule } from '../repository/repository.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module( {
  imports: [ RepositoryModule, RedisModule, AuthModule ],
  controllers: [ AddressController ],
  providers: [ AddressService ],
} )
export class AddressModule { }
