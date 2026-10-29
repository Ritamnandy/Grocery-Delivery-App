import type { LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { Params } from 'nestjs-pino';

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/** Nest built-in logger levels (development) */
export const nestLogLevels = ( level = 'debug' ): LogLevel[] =>
{
    const all: LogLevel[] = [ 'fatal', 'error', 'warn', 'log', 'debug', 'verbose' ];
    const map: Record<string, LogLevel> = { info: 'log', trace: 'verbose' };
    const target = map[ level ] ?? ( level as LogLevel );
    const idx = all.indexOf( target );
    return idx === -1 ? all.slice( 0, 4 ) : all.slice( 0, idx + 1 );
};

/** Pino config (production only) */
export const loggerConfig = ( config: ConfigService ): Params =>
{
    const level = config.get<string>( 'LOG_LEVEL', 'info' );
    const logToFile = config.get( 'LOG_TO_FILE', 'false' ) === 'true';
    const logDir = config.get<string>( 'LOG_DIR', './logs' );

    const targets: any[] = [
        // Raw JSON to stdout
        { target: 'pino/file', level, options: { destination: 1 } },
    ];

    if ( logToFile )
    {
        targets.push(
            {
                target: 'pino-roll',
                level,
                options: {
                    file: `${ logDir }/app`,
                    frequency: 'daily',
                    dateFormat: 'yyyy-MM-dd',
                    size: '10m',
                    mkdir: true,
                },
            },
            {
                target: 'pino-roll',
                level: 'error',
                options: {
                    file: `${ logDir }/error`,
                    frequency: 'daily',
                    dateFormat: 'yyyy-MM-dd',
                    size: '10m',
                    mkdir: true,
                },
            },
        );
    }

    return {
        pinoHttp: {
            level,
            transport: { targets },
            autoLogging: false,
            genReqId: ( req, res ) =>
            {
                const id = ( req.headers[ 'x-request-id' ] as string ) ?? randomUUID();
                res.setHeader( 'x-request-id', id );
                return id;
            },
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
            customLogLevel: ( _req, res, err ) =>
            {
                if ( err || res.statusCode >= 500 ) return 'error';
                if ( res.statusCode >= 400 ) return 'warn';
                return 'info';
            },
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