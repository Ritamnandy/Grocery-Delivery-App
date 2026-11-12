import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, IsNumber, IsObject, ValidateNested, IsOptional } from 'class-validator';

export class OrderItemDto
{
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Type( () => Number )
    quantity: number;
}

export class ShippingAddressDto
{
    @IsString()
    @IsNotEmpty()
    label: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    zip: string;

    @IsNumber()
    @Type( () => Number )
    lat: number;

    @IsNumber()
    @Type( () => Number )
    lng: number;
}

export class CreateOrderDto
{
    @IsArray()
    @ValidateNested( { each: true } )
    @Type( () => OrderItemDto )
    items: OrderItemDto[];

    @IsString()
    @IsNotEmpty()
    addressId: string;

    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @IsNumber()
    @Type( () => Number )
    subtotal: number;

    @IsNumber()
    @Type( () => Number )
    deliveryFee: number;

    @IsNumber()
    @Type( () => Number )
    tax: number;

    @IsNumber()
    @Type( () => Number )
    total: number;

    @IsObject()
    @ValidateNested()
    @Type( () => ShippingAddressDto )
    shippingAddress: ShippingAddressDto;
}

export class UpdateOrderStatusDto
{
    @IsString()
    @IsNotEmpty()
    status: string;

    @IsOptional()
    @IsString()
    note?: string;
}

export class AssignDeliveryPartnerDto
{
    @IsString()
    @IsNotEmpty()
    partnerId: string;
}

export class VerifyDeliveryOtpDto
{
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class UpdateLiveLocationDto
{
    @IsNumber()
    @Type( () => Number )
    lat: number;

    @IsNumber()
    @Type( () => Number )
    lng: number;
}
