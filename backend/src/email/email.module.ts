import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAME } from '../types/email.types.js';
import { EmailProcessor } from './email.processor.js';

@Module( {
  imports: [
    BullModule.registerQueue( {
      name: QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: { age: 7 * 24 * 3600, count: 1000 },
      },
    } ),
  ],
  providers: [ EmailService, EmailProcessor ],
  exports: [ EmailService ]
} )
export class EmailModule { }
