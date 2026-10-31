import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { RedisModule } from '../redis/redis.module.js';
import { ImageModule } from '../image/image.module.js';
import { RepositoryModule } from '../repository/repository.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module( {
  imports: [ RedisModule, ImageModule, RepositoryModule, AuthModule ],
  controllers: [ ProductsController ],
  providers: [ ProductsService ],
} )
export class ProductsModule { }
