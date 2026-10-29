

import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { Transform } from "class-transformer";

export class LoginuserDto
{
    @IsNotEmpty()
    @IsString()
    @Transform( ( { value } ) => ( typeof value === 'string' ? value.trim().toLowerCase() : value ) )
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password: string
}
