import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js';
import { ConfigService } from '@nestjs/config';




@Injectable()
export class PrismaService extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor ( private readonly configService: ConfigService )
    {
        const adapter = new PrismaPg( {
            connectionString: configService.getOrThrow( 'DATABASE_URL' ),
            // Maximum database connections in this pool
            max: 10,

            // Maximum time to establish a connection
            connectionTimeoutMillis: 5000,

            // Close idle connections after 10 seconds
            idleTimeoutMillis: 10000,
        } )
        super( { adapter } );
    }

    async onModuleInit ()
    {
        await this.$connect();
    }

    async onModuleDestroy ()
    {
        await this.$disconnect();
    }
}
