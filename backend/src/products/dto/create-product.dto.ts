import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateProductDto
{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @Type( () => Number )
    @IsNumber()
    price: number;

    @IsOptional()
    @Type( () => Number )
    @IsNumber()
    originalPrice?: number;

    @IsNotEmpty()
    @Type( () => Number )
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsNotEmpty()
    @IsString()
    unit: string;

    @IsNotEmpty()
    @Type( () => Boolean )
    @IsBoolean()
    isOrganic: boolean;
}







