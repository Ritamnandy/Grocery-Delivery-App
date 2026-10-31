

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { CreateProductDto } from "../products/dto/create-product.dto.js";
import { UpdateProductDto } from "../products/dto/update-product.dto.js";

@Injectable()
export class ProductsRepository
{
    private readonly logger = new Logger( ProductsRepository.name );

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

    async createProduct ( data: CreateProductDto, image: string, imageId: string )
    {
        try
        {
            return await this.prisma.product.create( {
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    originalPrice: data.originalPrice ?? 0,
                    stock: data.stock,
                    category: data.category,
                    unit: data.unit,
                    isOrganic: data.isOrganic,
                    image: image,
                    imageId: imageId
                }
            } );
        } catch ( error )
        {
            this.handleError( error, 'createProduct' );
        }
    }

    async updateProductWithoutImage ( productId: string, data: UpdateProductDto )
    {
        try
        {
            return await this.prisma.product.update( {
                where: { id: productId },
                data
            } );
        } catch ( error )
        {
            this.handleError( error, 'updateProduct' );
        }
    }

    async updateProductWithImage ( productId: string, data: UpdateProductDto, image: string, imageId: string )
    {
        try
        {
            return await this.prisma.product.update( {
                where: { id: productId },
                data: {
                    ...data,
                    image: image,
                    imageId: imageId
                }
            } );
        } catch ( error )
        {
            this.handleError( error, 'updateProduct' );
        }
    }

    async deleteProduct ( productId: string )
    {
        try
        {
            return await this.prisma.product.delete( {
                where: {
                    id: productId
                }
            } );
        } catch ( error )
        {
            this.handleError( error, 'deleteProducts' );
        }
    }

    async findAllProducts ()
    {
        try
        {
            return await this.prisma.product.findMany();
        } catch ( error )
        {
            this.handleError( error, 'findAllProducts' );
        }
    }


    async getFlashDeals ()
    {
        try
        {
            return await this.prisma.product.findMany( {
                where: {
                    stock: { gt: 0 }
                },
                orderBy: {
                    originalPrice: "desc"
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'getFlashDeals' );
        }
    }




}
