import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { CreateAddressDto } from "../address/dto/create-address.dto.js";
import { UpdateAddressDto } from "../address/dto/update-address.dto.js";

@Injectable()
export class AddressRepository
{
    private readonly logger = new Logger( AddressRepository.name );
    constructor ( private readonly prisma: PrismaService ) { }

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

    async createAddress ( data: CreateAddressDto, userId: string )
    {
        try
        {
            return await this.prisma.address.create( { data: { ...data,lat:0,lng:0, userId } } );
        }
        catch ( error )
        {
            this.handleError( error, 'createAddress' );
        }
    }

    async updateAddress ( data: UpdateAddressDto, addressId: string )
    {
        try
        {
            return await this.prisma.address.update( { where: { id: addressId }, data } );
        }
        catch ( error )
        {
            this.handleError( error, 'updateAddress' );
        }
    }

    async deleteAddress ( addressId: string )
    {
        try
        {
            return await this.prisma.address.delete( { where: { id: addressId } } );
        }
        catch ( error )
        {
            this.handleError( error, 'deleteAddress' );
        }
    }

    async getAddressById ( addressId: string )
    {
        try
        {
            return await this.prisma.address.findUnique( { where: { id: addressId } } );
        }
        catch ( error )
        {
            this.handleError( error, 'getAddressById' );
        }
    }

    async getUserAddresses ( userId: string )
    {
        try
        {
            return await this.prisma.address.findMany( { where: { userId } } );
        }
        catch ( error )
        {
            this.handleError( error, 'getUserAddresses' );
        }
    }

    async setDefaultAddress ( addressId: string, isDefault: boolean )
    {
        try
        {
            return await this.prisma.address.update( { where: { id: addressId }, data: { isDefault } } );
        }
        catch ( error )
        {
            this.handleError( error, 'setDefaultAddress' );
        }
    }

}