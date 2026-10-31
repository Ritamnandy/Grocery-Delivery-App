

import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class CreateAddressDto
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

    @IsNotEmpty()
    @Type( () => Boolean )
    @IsBoolean()
    isDefault: boolean;

    @IsNotEmpty()
    @Type( () => Number )
    @IsNumber()
    lat: number;

    @IsNotEmpty()
    @Type( () => Number )
    @IsNumber()
    lng: number;
}
