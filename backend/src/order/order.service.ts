import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { type OrderConfirmedData, type DeliveryConfirmedData } from '../types/email.types.js';
import { CreateOrderDto, UpdateOrderStatusDto, AssignDeliveryPartnerDto, VerifyDeliveryOtpDto, UpdateLiveLocationDto } from './dto/create-order.dto.js';
import { safeEqual } from '../utils/constants.js';

@Injectable()
export class OrderService
{
    private readonly logger = new Logger( OrderService.name );

    constructor (
        private readonly orderRepository: OrderRepository,
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    async placeOrder ( dto: CreateOrderDto, userId: string )
    {
        const address = await this.prisma.address.findFirst( {
            where: { id: dto.addressId, userId },
        } );
        if ( !address )
        {
            throw new NotFoundException( 'Address not found or does not belong to you' );
        }

        const user = await this.prisma.user.findUnique( { where: { id: userId } } );
        if ( !user )
        {
            throw new NotFoundException( 'User not found' );
        }

        const result = await this.orderRepository.createOrder( {
            userId,
            items: dto.items,
            addressId: dto.addressId,
            paymentMethod: dto.paymentMethod,
            subtotal: dto.subtotal,
            deliveryFee: dto.deliveryFee,
            tax: dto.tax,
            total: dto.total,
            shippingAddress: dto.shippingAddress,
        } );

        const orderData: OrderConfirmedData = {
            toEmail: user.email,
            name: user.name,
            orderId: result.id,
            items: ( result.items as any[] ?? [] ).map( ( it: any ) => ( {
                name: it.name,
                quantity: it.quantity,
                price: it.price,
            } ) ),
            subtotal: result.subtotal,
            deliveryFee: result.deliveryFee ?? 0,
            tax: result.tax ?? 0,
            total: result.total,
            address: result.shippingAddress as any,
            deliveryOtp: result.deliveryOtp ?? undefined,
            currency: '$',
        };

        try
        {
            await this.emailService.sendOrderConfirmationMail( orderData );
        } catch ( error )
        {
            this.logger.error( 'Failed to enqueue order confirmation email', error );
        }

        this.logger.log( `Order placed: ${ result.id } for user ${ userId }` );
        return {
            message: 'Order placed successfully',
            data: {
                id: result.id,
                status: result.status,
                total: result.total,
                deliveryOtp: result.deliveryOtp,
                createdAt: result.createdAt,
            },
        };
    }

    async getUserOrders ( userId: string )
    {
        const orders = await this.orderRepository.getUserOrders( userId );
        return {
            message: 'Orders retrieved successfully',
            data: orders,
        };
    }

    async getOrderById ( orderId: string, userId: string, role: string )
    {
        const isAdmin = role === 'admin';
        const order = await this.orderRepository.getOrderById( orderId, isAdmin ? undefined : userId );

        if ( role === 'delivery' && order.deliveryPartnerId !== userId )
        {
            throw new UnauthorizedException( 'You are not assigned to this order' );
        }

        return {
            message: 'Order retrieved successfully',
            data: order,
        };
    }

    async getAllOrders ()
    {
        const orders = await this.orderRepository.getAllOrders();
        return {
            message: 'All orders retrieved successfully',
            data: orders,
        };
    }

    async getPartnerOrders ( partnerId: string )
    {
        const orders = await this.orderRepository.getPartnerOrders( partnerId );
        return {
            message: 'Partner orders retrieved successfully',
            data: orders,
        };
    }

    async updateOrderStatus ( orderId: string, dto: UpdateOrderStatusDto, actorId: string, role: string )
    {
        const order = await this.orderRepository.getOrderById( orderId );
        if ( !order )
        {
            throw new NotFoundException( 'Order not found' );
        }

        if ( role === 'delivery' && order.deliveryPartnerId !== actorId )
        {
            throw new UnauthorizedException( 'You are not assigned to this order' );
        }

        const updated = await this.orderRepository.updateOrderStatus( orderId, dto.status, dto.note );

        if ( dto.status === 'delivered' )
        {
            try
            {
                const user = await this.prisma.user.findUnique( { where: { id: order.userId } } );
                const deliveryData: DeliveryConfirmedData = {
                    toEmail: user?.email ?? '',
                    name: user?.name,
                    orderId: updated.id,
                    deliveredAt: new Date().toISOString(),
                    total: updated.total,
                    partnerName: undefined,
                    itemCount: ( updated.items as any[] ?? [] ).length,
                    currency: '$',
                };
                await this.emailService.sendDeliveryConfirmationMail( deliveryData );
            } catch ( error )
            {
                this.logger.error( 'Failed to enqueue delivery confirmation email', error );
            }
        }

        this.logger.log( `Order ${ orderId } status updated to ${ dto.status }` );
        return {
            message: `Order status updated to ${ dto.status }`,
            data: updated,
        };
    }

    async assignDeliveryPartner ( orderId: string, dto: AssignDeliveryPartnerDto )
    {
        const updated = await this.orderRepository.assignDeliveryPartner( orderId, dto.partnerId );
        const partner = await this.prisma.deliveryPartner.findUnique( { where: { id: dto.partnerId } } );

        this.logger.log( `Partner ${ dto.partnerId } assigned to order ${ orderId }` );
        return {
            message: 'Delivery partner assigned successfully',
            data: { ...updated, partnerName: partner?.name },
        };
    }

    async verifyDeliveryOtp ( orderId: string, dto: VerifyDeliveryOtpDto, partnerId: string )
    {
        const order = await this.orderRepository.getOrderById( orderId );
        if ( !order )
        {
            throw new NotFoundException( 'Order not found' );
        }
        if ( order.deliveryPartnerId !== partnerId )
        {
            throw new UnauthorizedException( 'You are not assigned to this order' );
        }
        if ( !order.deliveryOtp )
        {
            throw new BadRequestException( 'No delivery OTP set for this order' );
        }

        const isValid = safeEqual( dto.otp, order.deliveryOtp ?? '' );
        if ( !isValid )
        {
            throw new UnauthorizedException( 'Invalid delivery OTP' );
        }

        return {
            message: 'OTP verified successfully',
            data: { verified: true },
        };
    }

    async updateLiveLocation ( orderId: string, dto: UpdateLiveLocationDto, partnerId: string )
    {
        const order = await this.orderRepository.getOrderById( orderId );
        if ( !order )
        {
            throw new NotFoundException( 'Order not found' );
        }
        if ( order.deliveryPartnerId !== partnerId )
        {
            throw new UnauthorizedException( 'You are not assigned to this order' );
        }

        await this.orderRepository.updateLiveLocation( orderId, { lat: dto.lat, lng: dto.lng } );
        return {
            message: 'Live location updated',
        };
    }

    async markPaid ( orderId: string, userId: string )
    {
        const order = await this.orderRepository.getOrderById( orderId, userId );
        if ( !order )
        {
            throw new NotFoundException( 'Order not found' );
        }

        await this.orderRepository.markPaid( orderId );
        return {
            message: 'Payment marked as paid',
        };
    }
}
