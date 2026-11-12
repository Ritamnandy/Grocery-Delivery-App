import { Body, Controller, Get, Patch, Param, Post, Req, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { DeliveryService } from './delivery.service.js';
import { LoginDeliveryDto } from './dto/login-delivery.dto.js';
import { CreateDeliveryPartnerDto, TogglePartnerDto } from './dto/create-delivery-partner.dto.js';
import { AuthGuard } from '../auth/authguard/auth.guard.js';
import { RoleGuard } from '../auth/roleguard/role.guard.js';
import { Roles } from '../auth/roledecorator/role.decorator.js';
import type { AuthenticatedRequest } from '../types/auth-request.type.js';
import { Throttle } from '@nestjs/throttler';

@Controller( 'delivery' )
@Throttle( {
    default: {
        limit: 30,
        ttl: 60_000,
    },
} )
export class DeliveryController
{
    private setAuthCookies ( res: Response, accessToken: string ): void
    {
        const isProd = process.env.NODE_ENV === 'production';

        res.cookie( 'accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 5 * 60 * 60 * 1000,
            path: '/',
        } );
    }

    constructor ( private readonly deliveryService: DeliveryService ) { }

    @Post( 'login' )
    @HttpCode( HttpStatus.OK )
    @Throttle( {
        default: {
            limit: 5,
            ttl: 60_000,
        },
    } )
    async login ( @Body() dto: LoginDeliveryDto, @Res( { passthrough: true } ) res: Response )
    {
        const result = await this.deliveryService.login( dto );
        this.setAuthCookies( res, result.accessToken );
        return {
            message: result.message,
            data: result.data,
        };
    }

    @Get( 'profile' )
    @UseGuards( AuthGuard )
    @HttpCode( HttpStatus.OK )
    async profile ( @Req() req: AuthenticatedRequest )
    {
        return await this.deliveryService.getPartnerProfile( req.user.id );
    }

    @Get( 'orders' )
    @UseGuards( AuthGuard )
    @HttpCode( HttpStatus.OK )
    async getOrders ( @Req() req: AuthenticatedRequest )
    {
        return await this.deliveryService.getPartnerOrders( req.user.id );
    }

    @Get( 'partners' )
    @UseGuards( AuthGuard, RoleGuard )
    @Roles( 'admin' )
    @HttpCode( HttpStatus.OK )
    async listPartners ()
    {
        return {
            message: 'Delivery partners retrieved successfully',
            data: await this.deliveryService.getAllPartners(),
        };
    }

    @Post( 'partners' )
    @UseGuards( AuthGuard, RoleGuard )
    @Roles( 'admin' )
    @HttpCode( HttpStatus.CREATED )
    async createPartner ( @Body() dto: CreateDeliveryPartnerDto )
    {
        return await this.deliveryService.createPartner( {
            name: dto.name,
            email: dto.email,
            password: dto.password,
            phone: dto.phone,
            vehicleType: dto.vehicleType,
        } );
    }

    @Patch( 'partners/:id/toggle' )
    @UseGuards( AuthGuard, RoleGuard )
    @Roles( 'admin' )
    @HttpCode( HttpStatus.OK )
    async togglePartner ( @Param( 'id' ) id: string, @Body() dto: TogglePartnerDto )
    {
        return await this.deliveryService.togglePartner( id, dto.isActive );
    }
}
