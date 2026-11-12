import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { generateOtp } from "../utils/constants.js";

export interface OrderItemInput {
    productId: string;
    quantity: number;
}

@Injectable()
export class OrderRepository
{
    private readonly logger = new Logger( OrderRepository.name );

    constructor ( private readonly prisma: PrismaService ) { }

    private handleError ( error: unknown, context: string, notFoundMsg: string = "Resource not found" ): never
    {
        if ( error instanceof PrismaClientKnownRequestError )
        {
            switch ( error.code )
            {
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
            throw new BadRequestException( 'Invalid data provided to database operation' );
        }
        this.logger.error(
            `[${ context }] Unexpected error: ${ ( error as Error )?.message }`,
            ( error as Error )?.stack,
        );
        throw new InternalServerErrorException(
            'Something went wrong, please try again later',
        );
    }

    async createOrder ( data: { userId: string; items: { productId: string; quantity: number }[]; addressId: string; paymentMethod: string; subtotal: number; deliveryFee: number; tax: number; total: number; shippingAddress: any } )
    {
        try
        {
            return await this.prisma.$transaction( async ( tx ) =>
            {
                const productIds = data.items.map( ( item ) => item.productId );
                const products = await tx.product.findMany( {
                    where: { id: { in: productIds } },
                } );

                if ( products.length !== data.items.length )
                {
                    throw new BadRequestException( 'One or more products in the cart are no longer available' );
                }

                const productById = new Map( products.map( ( p ) => [ p.id, p ] ) );

                for ( const item of data.items )
                {
                    const product = productById.get( item.productId );
                    if ( !product )
                    {
                        throw new BadRequestException( `Product ${ item.productId } not found` );
                    }
                    const stock = product.stock ?? 0;
                    if ( stock < item.quantity )
                    {
                        throw new BadRequestException( `Insufficient stock for ${ product.name }` );
                    }
                }

                const otp = generateOtp();
                const now = new Date();
                const statusHistory = [
                    {
                        status: 'placed',
                        timestamp: now.toISOString(),
                        note: 'Order placed successfully',
                    },
                ];

                const order = await tx.order.create( {
                    data: {
                        userId: data.userId,
                        items: data.items.map( ( item ) => {
                            const product = productById.get( item.productId );
                            if ( !product )
                            {
                                throw new BadRequestException( `Product ${ item.productId } not found` );
                            }
                            return {
                                productId: item.productId,
                                name: product.name,
                                image: product.image,
                                price: Number( product.price ),
                                quantity: item.quantity,
                                unit: product.unit ?? 'piece',
                            };
                        } ),
                        shippingAddress: data.shippingAddress,
                        paymentMethod: data.paymentMethod,
                        subtotal: data.subtotal,
                        deliveryFee: data.deliveryFee,
                        tax: data.tax,
                        total: data.total,
                        status: 'placed',
                        statusHistory,
                        deliveryOtp: otp,
                        isPaid: false,
                    },
                } );

                for ( const item of data.items )
                {
                    await tx.product.update( {
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    } );
                }

                this.logger.log( `Order created: ${ order.id } with OTP` );
                return { ...order, otp };
            } );
        } catch ( error )
        {
            this.handleError( error, 'createOrder' );
        }
    }

    async getUserOrders ( userId: string )
    {
        try
        {
            return await this.prisma.order.findMany( {
                where: { userId },
                orderBy: { createdAt: 'desc' },
            } );
        } catch ( error )
        {
            this.handleError( error, 'getUserOrders' );
        }
    }

    async getOrderById ( orderId: string, userId?: string )
    {
        try
        {
            const where: any = { id: orderId };
            if ( userId )
            {
                where.userId = userId;
            }

            const order = await this.prisma.order.findUnique( { where } );
            if ( !order )
            {
                throw new NotFoundException( 'Order not found' );
            }
            return order;
        } catch ( error )
        {
            this.handleError( error, 'getOrderById', 'Order not found' );
        }
    }

    async getAllOrders ()
    {
        try
        {
            return await this.prisma.order.findMany( {
                orderBy: { createdAt: 'desc' },
            } );
        } catch ( error )
        {
            this.handleError( error, 'getAllOrders' );
        }
    }

    async getPartnerOrders ( partnerId: string )
    {
        try
        {
            return await this.prisma.order.findMany( {
                where: { deliveryPartnerId: partnerId },
                orderBy: { createdAt: 'desc' },
            } );
        } catch ( error )
        {
            this.handleError( error, 'getPartnerOrders' );
        }
    }

    async updateOrderStatus ( orderId: string, status: string, note?: string )
    {
        try
        {
            const order = await this.prisma.order.findUnique( { where: { id: orderId } } );
            if ( !order )
            {
                throw new NotFoundException( 'Order not found' );
            }

            const statusHistory = ( order.statusHistory as any[] ?? [] ).concat( [
                {
                    status,
                    timestamp: new Date().toISOString(),
                    note: note ?? `Status updated to ${ status }`,
                },
            ] );

            return await this.prisma.order.update( {
                where: { id: orderId },
                data: {
                    status: status as any,
                    statusHistory,
                },
            } );
        } catch ( error )
        {
            this.handleError( error, 'updateOrderStatus' );
        }
    }

    async assignDeliveryPartner ( orderId: string, partnerId: string )
    {
        try
        {
            const order = await this.prisma.order.findUnique( { where: { id: orderId } } );
            if ( !order )
            {
                throw new NotFoundException( 'Order not found' );
            }

            const partner = await this.prisma.deliveryPartner.findUnique( { where: { id: partnerId } } );
            if ( !partner )
            {
                throw new NotFoundException( 'Delivery partner not found' );
            }

            return await this.prisma.order.update( {
                where: { id: orderId },
                data: { deliveryPartnerId: partnerId },
            } );
        } catch ( error )
        {
            this.handleError( error, 'assignDeliveryPartner' );
        }
    }

    async setDeliveryOtp ( orderId: string, otp: string )
    {
        try
        {
            return await this.prisma.order.update( {
                where: { id: orderId },
                data: { deliveryOtp: otp },
            } );
        } catch ( error )
        {
            this.handleError( error, 'setDeliveryOtp' );
        }
    }

    async updateLiveLocation ( orderId: string, location: { lat: number; lng: number } )
    {
        try
        {
            return await this.prisma.order.update( {
                where: { id: orderId },
                data: { liveLocation: location },
            } );
        } catch ( error )
        {
            this.handleError( error, 'updateLiveLocation' );
        }
    }

    async markPaid ( orderId: string )
    {
        try
        {
            return await this.prisma.order.update( {
                where: { id: orderId },
                data: { isPaid: true },
            } );
        } catch ( error )
        {
            this.handleError( error, 'markPaid' );
        }
    }
}
