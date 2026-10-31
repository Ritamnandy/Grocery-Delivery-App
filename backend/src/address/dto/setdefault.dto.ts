import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class SetDefaultDto {
    @IsNotEmpty()
    @Type( () => Boolean )
    @IsBoolean()
    isDefault: boolean;
}