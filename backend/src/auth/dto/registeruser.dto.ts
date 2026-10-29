
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";
import { Transform } from "class-transformer";

export class RegisteruserDto
{ 
    @IsNotEmpty()
    @IsString()
    @Length( 3, 50 )
    @Transform( ( { value } ) => ( typeof value === 'string' ? value.trim() : value ) )
    name: string

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
