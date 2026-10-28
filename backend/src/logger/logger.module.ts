import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { loggerConfig } from './logger.config.js';

@Module( {
    imports: [
        PinoLoggerModule.forRootAsync( {
            imports: [ ConfigModule ],
            inject: [ ConfigService ],
            useFactory: ( config: ConfigService ) => loggerConfig( config ),
        } ),
    ],
} )
export class LoggerModule { }
