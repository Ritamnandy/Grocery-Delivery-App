import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDeliveryDto
{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
