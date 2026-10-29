import { Controller, Get } from '@nestjs/common';

@Controller( 'health' )
export class AppController
{
    @Get()
    health ()
    {
        return { message: 'Server is running smoothly 🚀' };
    }

}
