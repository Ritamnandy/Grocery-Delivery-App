import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import  { type JobsOptions,Queue } from 'bullmq';
import { MailJob,QUEUE_NAME, type ChangedPasswordConfirmation, type DeliveryConfirmedData, type MailPayloads, type OrderConfirmedData, type ResetPassword, type VerifyEmail, type WellcomeMail } from '../types/email.types.js';

@Injectable()
export class EmailService
{
    private readonly jobOptions: JobsOptions = {
        attempts: 3,
        backoff: {
            type: 'exponential', // now correctly narrowed via JobsOptions typing
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    };
    constructor ( @InjectQueue( QUEUE_NAME ) private readonly mailQueue: Queue ) { }

    private async enqueue<K extends MailJob> (
        name: K,
        data: MailPayloads[ K ],
        opts?: JobsOptions,
    ): Promise<string | undefined>
    {
        const job = await this.mailQueue.add( name, data, opts );
        return job.id;
    }

    sendWelcomeMail ( data: WellcomeMail )
    {
        return this.enqueue( MailJob.Welcome, data );
    }

    sendVerifyEmailMail ( data: VerifyEmail )
    {
        return this.enqueue( MailJob.VerifyEmail, data );
    }

    sendResetPasswordMail ( data: ResetPassword )
    {
        return this.enqueue( MailJob.ResetPassword, data );
    }

    sendPasswordChangedMail ( data: ChangedPasswordConfirmation )
    {
        return this.enqueue( MailJob.PasswordChanged, data );
    }

    sendOrderConfirmationMail ( data: OrderConfirmedData )
    {
        return this.enqueue( MailJob.OrderConfirmed, data, {
            jobId: `order-confirmed-${ data.orderId }`,
        } );
    }

    sendDeliveryConfirmationMail ( data: DeliveryConfirmedData )
    {
        return this.enqueue( MailJob.DeliveryConfirmed, data, {
            jobId: `delivery-confirmed-${ data.orderId }`,
        } );
    }


}
