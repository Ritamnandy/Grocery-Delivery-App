

import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";

export class VerifyuserDto
{
    @IsNotEmpty()
    @IsString()
    @Transform( ( { value } ) => ( typeof value === 'string' ? value.trim().toLowerCase() : value ) )
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length( 6, 6 )
    otp: string;
}

