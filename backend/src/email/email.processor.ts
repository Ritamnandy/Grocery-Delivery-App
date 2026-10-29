import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job, UnrecoverableError } from 'bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import Nodemailer, { type Transporter } from 'nodemailer';

import { MailJob, QUEUE_NAME, type MailContent, type MailPayloads } from '../types/email.types.js';
import
{
    deliveryConfirmedTemplate,
    orderConfirmedTemplate,
    passwordChangedTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate,
    welcomeTemplate,
} from './email.templates.js';

const OTP_TTL_MIN = 5;
const RESET_LINK_TTL_MIN = 10; // keep in sync with where the token is created



const maskEmail = ( e?: string ) => ( e ? e.replace( /^(.).*(@.*)$/, '$1***$2' ) : 'unknown' );




@Processor( QUEUE_NAME, {
    concurrency: 5,
    limiter: { max: 10, duration: 1000 }, // at most 10 mails per second
} )

export class EmailProcessor extends WorkerHost
{
    private readonly transporter: Transporter;
    private readonly from: string;

    // One builder per job type; the compiler checks each payload type
    private readonly builders: { [ K in MailJob ]: ( d: MailPayloads[ K ] ) => MailContent } = {
        [ MailJob.Welcome ]: ( d ) => ( {
            to: d.toEmail,
            subject: 'Welcome to InstantMart!',
            html: welcomeTemplate( d.name ),
        } ),
        [ MailJob.VerifyEmail ]: ( d ) => ( {
            to: d.toEmail,
            subject: 'Verify your email',
            html: verifyEmailTemplate( d.otp, d.name, OTP_TTL_MIN ),
        } ),
        [ MailJob.ResetPassword ]: ( d ) => ( {
            to: d.toEmail,
            subject: 'Reset your password',
            html: resetPasswordTemplate( d.link, d.name, RESET_LINK_TTL_MIN ),
        } ),
        [ MailJob.PasswordChanged ]: ( d ) => ( {
            to: d.toEmail,
            subject: 'Your password was changed',
            html: passwordChangedTemplate( d.name ),
        } ),
        [ MailJob.OrderConfirmed ]: ( d ) => ( {
            to: d.toEmail,
            subject: `Order #${ d.orderId.slice( -8 ).toUpperCase() } confirmed`,
            html: orderConfirmedTemplate( d, d.name ),
        } ),
        [ MailJob.DeliveryConfirmed ]: ( d ) => ( {
            to: d.toEmail,
            subject: 'Your order has been delivered',
            html: deliveryConfirmedTemplate( d, d.name ),
        } ),
    };

    constructor (
        @InjectPinoLogger( EmailProcessor.name ) private readonly logger: PinoLogger,
        config: ConfigService,
    )
    {
        super();
        const user = config.getOrThrow<string>( 'MAIL_USER' );
        this.from = `"InstantMart" <${ user }>`;

        this.transporter = Nodemailer.createTransport( {
            service: 'gmail',
            pool: true,
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 20_000,
            auth: { user, pass: config.getOrThrow<string>( 'MAIL_PASSWORD' ) },
        } );
    }

    async process ( job: Job ): Promise<{ messageId: string }>
    {
        const build = this.builders[ job.name as MailJob ] as
            | ( ( d: unknown ) => MailContent )
            | undefined;

        // Retrying an unknown job name can never succeed
        if ( !build ) throw new UnrecoverableError( `Unknown mail job: ${ job.name }` );

        const { to, subject, html } = build( job.data );

        try
        {
            const info = await this.transporter.sendMail( { from: this.from, to, subject, html } );

            this.logger.info(
                { jobId: job.id, jobName: job.name, to: maskEmail( to ), messageId: info.messageId },
                'Mail sent',
            );
            return { messageId: info.messageId }; // return only what you need to keep
        } catch ( err: any )
        {
            // Permanent failures: bad recipient or SMTP 5xx rejection
            const permanent =
                err?.code === 'EENVELOPE' || ( err?.responseCode >= 500 && err?.responseCode < 600 );
            if ( permanent ) throw new UnrecoverableError( err.message );
            throw err; // transient (network, timeout, 4xx): let BullMQ retry with backoff
        }
    }

    // Single place for failure logging; no duplicate logs
    @OnWorkerEvent( 'failed' )
    onFailed ( job: Job | undefined, err: Error )
    {
        if ( !job ) return;
        const maxAttempts = job.opts.attempts ?? 1;
        const isFinal = err instanceof UnrecoverableError || job.attemptsMade >= maxAttempts;

        const fields = {
            err,
            jobId: job.id,
            jobName: job.name,
            to: maskEmail( ( job.data as { toEmail?: string } )?.toEmail ),
            attempt: job.attemptsMade,
            maxAttempts,
        };

        if ( isFinal ) this.logger.error( fields, 'Mail job failed permanently' );
        else this.logger.warn( fields, 'Mail job failed, will retry' );
    }
}