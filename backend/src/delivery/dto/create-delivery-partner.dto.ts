import { IsString, IsNotEmpty, IsEmail, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryPartnerDto
{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    vehicleType: string;
}

export class TogglePartnerDto
{
    @IsNotEmpty()
    @Type( () => Boolean )
    @IsBoolean()
    isActive: boolean;
}