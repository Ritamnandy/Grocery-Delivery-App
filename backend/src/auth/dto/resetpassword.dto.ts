
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ResetpasswordDto
{
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password: string

    @IsNotEmpty()
    @IsString()
    token: string
}
