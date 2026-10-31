import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { Throttle } from '@nestjs/throttler';
import { RegisteruserDto } from './dto/registeruser.dto.js';
import { ResendcodeDto } from './dto/resendcode.dto.js';
import { VerifyuserDto } from './dto/verifyuser.dto.js';
import { LoginuserDto } from './dto/loginuser.dto.js';
import { RefreshtokenDto } from './dto/refreshtoken.dto.js';
import { AuthGuard } from './authguard/auth.guard.js';
import type { AuthenticatedRequest } from '../types/auth-request.type.js';
import { ResetpasswordDto } from './dto/resetpassword.dto.js';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import type { GoogleOauthBody } from '../types/google.oauth.js';
import { ConfigService } from '@nestjs/config';

@Controller( 'auth' )
export class AuthController
{
    private setAuthCookies (
        res: Response,
        accessToken: string,
        refreshToken: string,
    ): void
    {
        const isProd = process.env.NODE_ENV === 'production';

        res.cookie( 'accessToken', accessToken, {
            httpOnly: true,
            secure: isProd, // must be true in prod (HTTPS); false locally over http
            sameSite: 'strict',
            maxAge: 5 * 60 * 60 * 1000, // 1 hour — match access token expiry
            path: '/',
        } );

        res.cookie( 'refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days — match refresh token expiry
            path: '/auth/refresh-access-token', // scope it — only sent on the refresh endpoint, reduces exposure
        } );
    }

    constructor (
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Post( 'register' )
    @HttpCode( HttpStatus.ACCEPTED )
    async registerUser ( @Body() data: RegisteruserDto )
    {
        const result = await this.authService.registerUser( data );
        return result;
    }

    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Post( 'resend-otp' )
    @HttpCode( HttpStatus.OK )
    async resendOtp ( @Body() data: ResendcodeDto )
    {
        return await this.authService.resendOtpCode( data );

    }


    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Post( 'verify' )
    @HttpCode( HttpStatus.CREATED )
    async verifyUser ( @Body() data: VerifyuserDto, @Res( { passthrough: true } ) res: Response )
    {
        const result = await this.authService.verifyEmail( data );
        // console.log( result );

        this.setAuthCookies( res, result.accessToken ?? '', result.refreshToken ?? '' );
        return { message: result.message, data: result.data };
    }



    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Post( 'login' )
    @HttpCode( HttpStatus.OK )
    async login ( @Body() data: LoginuserDto, @Res( { passthrough: true } ) res: Response )
    {
        const result = await this.authService.loginUser( data );
        this.setAuthCookies( res, result.accessToken ?? '', result.refreshToken ?? '' );
        return { message: result.message, data: result.data };
    }


    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Patch( 'refresh-access-token' )
    @HttpCode( HttpStatus.OK )
    async refreshAccessToken ( @Body() data: RefreshtokenDto, @Res( { passthrough: true } ) res: Response )
    {
        const result = await this.authService.refreshAccessToken( data.refreshToken );
        this.setAuthCookies( res, result.accessToken ?? '', result.refreshToken ?? '' );
        return { message: result.message };
    }


    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Post( 'forget-password' )
    @HttpCode( HttpStatus.OK )
    async forgotPassword ( @Body() data: ResendcodeDto )
    {
        const result = await this.authService.forgotPassword( data );
        return result;
    }


    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Patch( 'reset-password' )
    @HttpCode( HttpStatus.OK )
    async resetPassword ( @Body() data: ResetpasswordDto )
    {
        const result = await this.authService.resetPassword( data );
        return result;
    }

    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Get( 'google' )
    @UseGuards( PassportAuthGuard( 'google' ) )
    googleLogin ()
    {
        // Passport redirects to Google
    }


    @Get( 'google/callback' )
    @UseGuards( PassportAuthGuard( 'google' ) )
    async googleCallback ( @Body() data: GoogleOauthBody, @Res( { passthrough: true } ) res: Response )
    {
        const response = await this.authService.googleLogin( data );
        this.setAuthCookies( res, response.accessToken ?? '', response.refreshToken ?? '' );
        const homePage = this.configService.getOrThrow( 'SUCCESS_URL' );
        const errorPage = this.configService.getOrThrow( 'ERROR_URL' );
        if ( response.success )
        {

            // return res.redirect( homePage );
            return response.message;
        }

        // return res.redirect( errorPage );
        return response.message;
    }


    //  protected routes
    @Throttle( {
        default: {
            limit: 5, // limit each IP to 5 requests per `window`
            ttl: 60_000,
        },
    } )
    @Delete( 'logout' )
    @HttpCode( HttpStatus.OK )
    @UseGuards( AuthGuard )
    async logout ( @Res( { passthrough: true } ) res: Response, @Req() req: AuthenticatedRequest )
    {
        const response = await this.authService.logOutUser( req.user.id );
        res.clearCookie( 'accessToken' );
        res.clearCookie( 'refreshToken' );

        return response;
    }
}
