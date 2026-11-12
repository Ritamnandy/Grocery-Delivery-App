import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderService } from '../order/order.service.js';
import { comparePassword, hashPassword, safeEqual } from '../utils/constants.js';
import { LoginDeliveryDto } from './dto/login-delivery.dto.js';

@Injectable()
export class DeliveryService
{
    private readonly logger = new Logger( DeliveryService.name );

    constructor (
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly orderService: OrderService,
    ) { }

    async login ( dto: LoginDeliveryDto )
    {
        const partner = await this.prisma.deliveryPartner.findUnique( { where: { email: dto.email } } );
        if ( !partner )
        {
            throw new NotFoundException( 'No delivery partner found with this email' );
        }

        let isValid = false;
        try
        {
            isValid = await comparePassword( dto.password, partner.password );
        } catch
        {
            isValid = safeEqual( dto.password, partner.password );
        }
        if ( !isValid )
        {
            throw new UnauthorizedException( 'Invalid email or password' );
        }
        if ( partner.isActive === false )
        {
            throw new UnauthorizedException( 'Your account is deactivated. Contact admin.' );
        }

        const payload = {
            id: partner.id,
            email: partner.email,
            role: 'delivery',
        };

        const accessToken = await this.jwtService.signAsync( payload, {
            secret: this.configService.getOrThrow<string>( 'JWT_SECRET' ),
            expiresIn: this.configService.getOrThrow<string>( 'JWT_EXPIRES_IN' ) as StringValue,
        } );

        this.logger.log( `Delivery partner logged in: ${ partner.email }` );
        return {
            message: 'Logged in successfully',
            data: {
                id: partner.id,
                name: partner.name,
                email: partner.email,
                phone: partner.phone,
                vehicleType: partner.vehicleType,
                isActive: partner.isActive,
            },
            accessToken,
        };
    }

    async getPartnerProfile ( partnerId: string )
    {
        const partner = await this.prisma.deliveryPartner.findUnique( { where: { id: partnerId } } );
        if ( !partner )
        {
            throw new NotFoundException( 'Delivery partner not found' );
        }
        const { password, ...rest } = partner;
        return {
            message: 'Partner profile retrieved',
            data: rest,
        };
    }

    async getPartnerOrders ( partnerId: string )
    {
        return await this.orderService.getPartnerOrders( partnerId );
    }

    async getAllPartners ()
    {
        const partners = await this.prisma.deliveryPartner.findMany( {
            orderBy: { createdAt: 'desc' },
        } );
        return partners.map( ( { password, ...rest } ) => rest );
    }

    async createPartner ( data: { name: string; email: string; password: string; phone: string; vehicleType?: string } )
    {
        const existing = await this.prisma.deliveryPartner.findUnique( { where: { email: data.email } } );
        if ( existing )
        {
            throw new BadRequestException( 'A delivery partner with this email already exists' );
        }

        const passwordHash = await hashPassword( data.password );

        const partner = await this.prisma.deliveryPartner.create( {
            data: {
                name: data.name,
                email: data.email,
                password: passwordHash,
                phone: data.phone,
                vehicleType: ( data.vehicleType ?? 'bike' ) as any,
                isActive: true,
            },
        } );
        const { password, ...rest } = partner;
        return {
            message: 'Delivery partner created',
            data: rest,
        };
    }

    async togglePartner ( partnerId: string, isActive: boolean )
    {
        const partner = await this.prisma.deliveryPartner.findUnique( { where: { id: partnerId } } );
        if ( !partner )
        {
            throw new NotFoundException( 'Delivery partner not found' );
        }

        const updated = await this.prisma.deliveryPartner.update( {
            where: { id: partnerId },
            data: { isActive },
        } );
        const { password, ...rest } = updated;
        return {
            message: `Partner ${ isActive ? 'activated' : 'deactivated' }`,
            data: rest,
        };
    }
}
