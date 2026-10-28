

import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { Params } from 'nestjs-pino';


export const loggerConfig = ( config: ConfigService ): Params =>
{
    const isProd = config.get( 'NODE_ENV' ) === 'production';
    const level = config.get<string>( 'LOG_LEVEL', isProd ? 'info' : 'debug' );
    const logToFile = config.get( 'LOG_TO_FILE', 'true' ) === 'true';
    const logDir = config.get<string>( 'LOG_DIR', './logs' );

    const targets: any[] = [];

    // Console: pretty in dev, raw JSON in prod
    targets.push(
        isProd
            ? { target: 'pino/file', level, options: { destination: 1 } } // stdout
            : {
                target: 'pino-pretty',
                level,
                options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                    ignore: 'pid,hostname',
                },
            },
    );

    if ( logToFile )
    {
        // All logs, rotated daily or at 10 MB
        targets.push( {
            target: 'pino-roll',
            level,
            options: {
                file: `${ logDir }/app`,
                frequency: 'daily',
                dateFormat: 'yyyy-MM-dd',
                size: '10m',
                mkdir: true,
            },
        } );

        // Errors only
        targets.push( {
            target: 'pino-roll',
            level: 'error',
            options: {
                file: `${ logDir }/error`,
                frequency: 'daily',
                dateFormat: 'yyyy-MM-dd',
                size: '10m',
                mkdir: true,
            },
        } );
    }

    return {
        pinoHttp: {
            level,
            transport: { targets },
            autoLogging: false, // our middleware handles request logs now
            genReqId: ( req, res ) =>
            {
                const id = ( req.headers[ 'x-request-id' ] as string ) ?? randomUUID();
                res.setHeader( 'x-request-id', id );
                return id;
            },
            // Never write secrets to logs
            redact: {
                paths: [
                    'req.headers.authorization',
                    'req.headers.cookie',
                    'res.headers["set-cookie"]',
                    'req.body.password',
                    'req.body.token',
                ],
                censor: '[REDACTED]',
            },
            // Log level by status code
            customLogLevel: ( _req, res, err ) =>
            {
                if ( err || res.statusCode >= 500 ) return 'error';
                if ( res.statusCode >= 400 ) return 'warn';
                return 'info';
            },

            // Keep request logs small
            serializers: {
                req: ( req ) => ( {
                    id: req.id,
                    method: req.method,
                    url: req.url,
                    remoteAddress: req.remoteAddress,
                } ),
                res: ( res ) => ( { statusCode: res.statusCode } ),
            },
        },
    };
};