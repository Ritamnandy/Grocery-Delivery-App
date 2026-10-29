import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class RedisService implements OnModuleDestroy
{
    private readonly redis: Redis;
    private readonly logger = new Logger( RedisService.name );
    constructor (

        
        private readonly configService: ConfigService,
    )
    {
        this.redis = new Redis(
            this.configService.getOrThrow<string>( 'REDIS_URL' ),
        );
        this.redis.on( 'error', ( error ) =>
        {
            this.logger.error( 'Redis error:', error )
        } )
        this.redis.on( 'connect', () => this.logger.log( 'Redis connected' ) )
    }

    async get ( key: string ): Promise<string | null>
    {
        return this.redis.get( key );
    }

    async set ( key: string, value: string, ttl: number ): Promise<'OK'>
    {
        return this.redis.set( key, value, 'EX', ttl );
    }

    async del ( key: string ): Promise<number>
    {
        return this.redis.del( key );
    }

    async getClient (): Promise<Redis>
    {
        return this.redis;

    }

    async onModuleDestroy ()
    {
        this.logger.warn( 'Redis disconnect' )
        await this.redis.quit();
    }
}
