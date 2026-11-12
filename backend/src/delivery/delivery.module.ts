import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service.js';
import { DeliveryController } from './delivery.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OrderModule } from '../order/order.module.js';

@Module( {
    imports: [ PrismaModule, OrderModule ],
    controllers: [ DeliveryController ],
    providers: [ DeliveryService ],
    exports: [ DeliveryService ],
} )
export class DeliveryModule { }
