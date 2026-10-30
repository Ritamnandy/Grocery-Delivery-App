import { Controller, Get, HttpCode, HttpStatus, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../auth/authguard/auth.guard.js';
import type { AuthenticatedRequest } from '../types/auth-request.type.js';
import  { UserService } from './user.service.js';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller( 'user' )
@UseGuards( AuthGuard )
export class UserController
{
    constructor ( private readonly userService: UserService ) { }



    @Throttle( {
        default: {
            limit: 10, // limit each IP to 10 requests per `window`
            ttl: 60_000,
        },
    } )
    @Get( 'profile' )
    @HttpCode( HttpStatus.OK )
    async getProfile ( @Req() req: AuthenticatedRequest )
    {
        return await this.userService.gerCurrentUser( req.user.id );
    }


    @Throttle( {
        default: {
            limit: 10, // limit each IP to 10 requests per `window`
            ttl: 60_000,
        },
    } )
    @Post( 'profile-image' )
    @HttpCode( HttpStatus.OK )
    @UseInterceptors(
        FileInterceptor( 'profileImage' ),
    )
    async setProfileImage ( @Req() req: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File )
    {
        console.log( file );

        return await this.userService.setUserImages( req.user.id, file );
    }



}
