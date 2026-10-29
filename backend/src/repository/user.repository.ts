import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";

@Injectable()
export class UserRepository
{

    constructor (
        @InjectPinoLogger( UserRepository.name ) private readonly logger: PinoLogger,
        private readonly prisma: PrismaService
    ) { }

    private handleError ( error: unknown, context: string, notFoundMsg: string = "Resource not found" ): never
    {
        if ( error instanceof PrismaClientKnownRequestError )
        {
            switch ( error.code )
            {
                case 'p2002':
                    this.logger.warn( `[${ context }] Unique constraint violation: ${ JSON.stringify( error.meta?.target ) }`, )
                    throw new ConflictException(
                        'A record with these details already exists',
                    );
                case 'p2025':
                    this.logger.warn( `[${ context }] Record not found` );
                    throw new NotFoundException( notFoundMsg );

                default:
                    this.logger.error(
                        `[${ context }] Prisma error ${ error.code }: ${ error.message }`,
                    );
                    throw new InternalServerErrorException( 'Database operation failed' );
            }
        }
        if ( error instanceof PrismaClientValidationError )
        {
            this.logger.error(
                `[${ context }] Prisma validation error: ${ error.message }`,
            );
            throw new BadRequestException(
                'Invalid data provided to database operation',
            );
        }
        this.logger.error(
            `[${ context }] Unexpected error: ${ ( error as Error )?.message }`,
            ( error as Error )?.stack,
        );
        throw new InternalServerErrorException(
            'Something went wrong, please try again later',
        );
    }

    async setUserProfileImage ( userId: string, image: string, fileId: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: {
                    id: userId
                },
                data: {
                    avatar: image,
                    avatarId: fileId
                },
                select: {
                    avatar: true
                }
            } )
        }
        catch ( error )
        {
            this.handleError( error, 'setUserProfileImage' );
        }
    }

    async deleteImageFormDb ( userId: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: {
                    id: userId
                },
                data: {
                    avatar: null,
                    avatarId: null
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'deleteImageFormDb' );
        }
    }       
}