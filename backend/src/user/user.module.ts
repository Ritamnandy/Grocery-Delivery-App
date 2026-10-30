import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { RepositoryModule } from '../repository/repository.module.js';
import { ImageModule } from '../image/image.module.js';
import { RedisModule } from '../redis/redis.module.js';


@Module( {
  imports: [AuthModule, RepositoryModule, ImageModule, RedisModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
