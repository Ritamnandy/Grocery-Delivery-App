import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { RepositoryModule } from '../repository/repository.module.js';
import { EmailModule } from '../email/email.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module( {
    imports: [ RepositoryModule, EmailModule, PrismaModule ],
    controllers: [ OrderController ],
    providers: [ OrderService ],
    exports: [ OrderService ],
} )
export class OrderModule { }
