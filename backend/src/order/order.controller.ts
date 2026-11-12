import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto, UpdateOrderStatusDto, AssignDeliveryPartnerDto, VerifyDeliveryOtpDto, UpdateLiveLocationDto } from './dto/create-order.dto.js';
import { AuthGuard } from '../auth/authguard/auth.guard.js';
import { Roles } from '../auth/roledecorator/role.decorator.js';
import { RoleGuard } from '../auth/roleguard/role.guard.js';
import type { AuthenticatedRequest } from '../types/auth-request.type.js';
import { Throttle } from '@nestjs/throttler';

@Controller( 'orders' )
@UseGuards( AuthGuard )
@Throttle( {
    default: {
        limit: 30,
        ttl: 60_000,
    },
} )
export class OrderController
{
    constructor ( private readonly orderService: OrderService ) { }

    @Post()
    @HttpCode( HttpStatus.CREATED )
    async placeOrder ( @Body() dto: CreateOrderDto, @Req() req: AuthenticatedRequest )
    {
        return await this.orderService.placeOrder( dto, req.user.id );
    }

    @Get()
    @HttpCode( HttpStatus.OK )
    async getMyOrders ( @Req() req: AuthenticatedRequest )
    {
        return await this.orderService.getUserOrders( req.user.id );
    }

    @Get( ':id' )
    @HttpCode( HttpStatus.OK )
    async getOrder ( @Param( 'id' ) id: string, @Req() req: AuthenticatedRequest )
    {
        return await this.orderService.getOrderById( id, req.user.id, req.user.role );
    }

    @Get( 'admin/all' )
    @UseGuards( RoleGuard )
    @Roles( 'admin' )
    @HttpCode( HttpStatus.OK )
    async getAllOrders ()
    {
        return await this.orderService.getAllOrders();
    }

    @Patch( ':id/status' )
    @UseGuards( RoleGuard )
    @Roles( 'admin', 'delivery' )
    @HttpCode( HttpStatus.OK )
    async updateStatus (
        @Param( 'id' ) id: string,
        @Body() dto: UpdateOrderStatusDto,
        @Req() req: AuthenticatedRequest,
    )
    {
        return await this.orderService.updateOrderStatus( id, dto, req.user.id, req.user.role );
    }

    @Patch( ':id/assign-partner' )
    @UseGuards( RoleGuard )
    @Roles( 'admin' )
    @HttpCode( HttpStatus.OK )
    async assignPartner (
        @Param( 'id' ) id: string,
        @Body() dto: AssignDeliveryPartnerDto,
    )
    {
        return await this.orderService.assignDeliveryPartner( id, dto );
    }

    @Patch( ':id/verify-otp' )
    @HttpCode( HttpStatus.OK )
    async verifyOtp (
        @Param( 'id' ) id: string,
        @Body() dto: VerifyDeliveryOtpDto,
        @Req() req: AuthenticatedRequest,
    )
    {
        return await this.orderService.verifyDeliveryOtp( id, dto, req.user.id );
    }

    @Patch( ':id/live-location' )
    @HttpCode( HttpStatus.OK )
    async updateLocation (
        @Param( 'id' ) id: string,
        @Body() dto: UpdateLiveLocationDto,
        @Req() req: AuthenticatedRequest,
    )
    {
        return await this.orderService.updateLiveLocation( id, dto, req.user.id );
    }

    @Patch( ':id/paid' )
    @HttpCode( HttpStatus.OK )
    async markPaid (
        @Param( 'id' ) id: string,
        @Req() req: AuthenticatedRequest,
    )
    {
        return await this.orderService.markPaid( id, req.user.id );
    }
}
