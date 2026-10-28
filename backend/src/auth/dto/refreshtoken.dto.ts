


import { IsNotEmpty, IsString } from "class-validator";

export class RefreshtokenDto
{
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

