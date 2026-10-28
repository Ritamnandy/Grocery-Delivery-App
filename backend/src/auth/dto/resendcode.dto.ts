

import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResendcodeDto
{
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}

