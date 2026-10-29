

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { RegisteruserDto } from "../auth/dto/registeruser.dto.js";
import { GoogleOauthBody } from "../types/google.oauth.js";
;

@Injectable()
export class AuthRepository
{

    constructor (
        @InjectPinoLogger( AuthRepository.name ) private readonly logger: PinoLogger,
        private readonly prisma: PrismaService,
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

    async createUser ( data: RegisteruserDto )
    {
        try
        {

            return await this.prisma.user.create( {
                data: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: 'user',
                    isVerified: true,
                    status: 'active',
                },

            } )

        }
        catch ( error )
        {
            this.handleError( error, 'createUser' );
        }
    }

    async findUserByEmail ( email: string )
    {
        try
        {
            return await this.prisma.user.findUnique( {
                where: {
                    email: email,
                },
            } )
        }
        catch ( error )
        {
            this.handleError( error, 'findUserByEmail' );
        }
    }

    async findUserById ( id: string )
    {
        try
        {
            return await this.prisma.user.findUnique( {
                where: {
                    id: id,
                },
            } )
        }
        catch ( error )
        {
            this.handleError( error, 'findUserById' );
        }
    }

    async logOutUser ( userId: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: {
                    id: userId,
                },
                data: {
                    refreshToken: null,
                    status: 'deleted',
                },
            } )
        }
        catch ( error )
        {
            this.handleError( error, 'logOutUser' );
        }
    }


    async updateUserRefreshToken ( userId: string, refreshToken: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: {
                    id: userId,
                },
                data: {
                    refreshToken: refreshToken,
                },
            } )
        }
        catch ( error )
        {
            this.handleError( error, 'updateUserRefreshToken' );
        }
    }

    async updateUserPassword ( userId: string, password: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: {
                    id: userId,
                },
                data: {
                    password: password,
                },
            } )
        }
        catch ( error )
        {
            this.handleError( error, 'updateUserPassword' );
        }
    }

    async googleLogin ( data: GoogleOauthBody )
    {
        try
        {
            return await this.prisma.user.create( {
                data: {
                    googleId: data.googleId,
                    email: data.email,
                    name: data.name,
                    avatar: data.profileImage,
                    isVerified: data.isEmailVerified,
                    role: 'user',
                    status: 'active'
                }
            } )

        }
        catch ( error )
        {
            this.handleError( error, 'googleLogin' );
        }
    }

    async findUserByGoogleId ( googleId: string )
    {
        try
        {
            return await this.prisma.user.findUnique( {
                where: {
                    googleId
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'findUserByGoogleId' );
        }
    }

    async linkWithGoogleId ( userId: string, googleId: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: {
                    id: userId
                },
                data: {
                    googleId
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'linkWithGoogleId' );
        }
    }

   

}
