import { BadRequestException, HttpException, Injectable, NotFoundException, UnauthorizedException, UploadedFile } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service.js';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { ImageService } from '../image/image.service.js';
import { StringValue } from 'ms';
import type { JwtPayload, JwtRefreshPayload } from '../types/payload.types.js';
import { RegisteruserDto } from './dto/registeruser.dto.js';
import { comparePassword, createHashData, createRowToken, generateOtp, hashPassword, ResetPasswordLink, safeEqual } from '../utils/constants.js';
import { OTP_EXPIRY, OTP_RESEND_COOLDOWN, otpCooldownKey, otpKey, profileKey, REGISTER_DATA_EXPIRY, registerKey, resetTokenKey } from '../utils/redis.key.js';
import { ResendcodeDto } from './dto/resendcode.dto.js';
import { VerifyuserDto } from './dto/verifyuser.dto.js';
import { LoginuserDto } from './dto/loginuser.dto.js';
import { ResetpasswordDto } from './dto/resetpassword.dto.js';
import { GoogleOauthBody } from '../types/google.oauth.js';
import { AuthRepository } from '../repository/auth.repository.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class AuthService
{
    constructor (
        @InjectPinoLogger( AuthService.name ) private readonly logger: PinoLogger,
        private readonly authRepository: AuthRepository,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly imageService: ImageService,
        private readonly mailsService: EmailService
    ) { }

    private async clearUserProfileCache ( userId: string )
    {
        await this.redisService.del( profileKey( userId ) )
    }

    private createPayLoad ( payload: JwtRefreshPayload ): { jwt: JwtPayload, refresh: JwtRefreshPayload }
    {
        const jwt: JwtPayload = {
            id: payload.id,
            email: payload.email,
            role: payload.role
        }
        const refresh: JwtRefreshPayload = {
            id: payload.id,
            email: payload.email,
            role: payload.role
        }
        return { jwt, refresh };
    }

    private async genarateTokenPair ( jwtpayload: JwtPayload, refreshTokenPaload: JwtRefreshPayload ): Promise<{ accessToken: string, refreshToken: string }>
    {
        const accessToken = await this.jwtService.signAsync( jwtpayload, {
            secret: this.configService.getOrThrow<string>( 'JWT_SECRET' ),

            expiresIn: this.configService.getOrThrow<string>( 'JWT_EXPIRES_IN' ) as StringValue
        } );

        const refreshToken = await this.jwtService.signAsync( refreshTokenPaload, {
            secret: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_SECRET' ),

            expiresIn: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_EXPIRES_IN' ) as StringValue
        } );
        await this.authRepository.updateUserRefreshToken( refreshTokenPaload.id, createHashData( refreshToken ) )
        return { accessToken, refreshToken };
    }

    private async decodeRefreshToken ( refreshToken: string ): Promise<JwtRefreshPayload>
    {
        try
        {
            const response: JwtRefreshPayload = await this.jwtService.verifyAsync( refreshToken, {
                secret: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_SECRET' )
            } )
            return response
        } catch ( error )
        {
            if ( error instanceof TokenExpiredError )
            {
                throw new UnauthorizedException( 'Refresh token expired' )
            }
            if ( error instanceof JsonWebTokenError )
            {
                throw new UnauthorizedException( `Invalid refresh token` )
            }
            if ( error instanceof NotBeforeError )
            {
                throw new UnauthorizedException( `Refresh token not yet valid` )
            }
            this.logger.error( 'Error decoding refresh token:', error instanceof Error ? error.message : error )
            throw new UnauthorizedException( 'Invalid refresh token' )
        }
    }

    async registerUser ( data: RegisteruserDto )
    {
        const existingUser = await this.authRepository.findUserByEmail( data.email )
        if ( existingUser )
        {
            throw new BadRequestException( 'User with this email already exists' )
        }
        const otp = generateOtp()
        const passwordHash = await hashPassword( data.password );
        await Promise.all( [
            this.redisService.set( registerKey( data.email ), JSON.stringify( { ...data, password: passwordHash } ), REGISTER_DATA_EXPIRY ),
            this.redisService.set( otpKey( data.email ), otp, OTP_EXPIRY ),
            this.mailsService.sendVerifyEmailMail( {
                name: data.name,
                toEmail: data.email,
                otp
            } ).catch( ( error ) =>
            {
                this.logger.error( 'Failed to send verification email,inside register service', error )
            } )
        ] )
        this.logger.info( "User registration issued", { email: data.email } )
        return {
            message: "OTP sent successfully , please verify your email"
        }
    }

    async resendOtpCode ( data: ResendcodeDto )
    {
        if ( await this.redisService.get( otpCooldownKey( data.email ) ) )
        {
            throw new HttpException( 'Please wait before requesting another OTP', 429 )
        }

        const cacheUser = await this.redisService.get( registerKey( data.email ) )
        if ( !cacheUser )
        {
            throw new BadRequestException( 'Sign Up Session expired, please register again' )
        }

        const { name } = JSON.parse( cacheUser ) as { name: string }

        const otp = generateOtp()
        await Promise.all( [
            this.redisService.set( otpKey( data.email ), otp, OTP_EXPIRY ),
            this.redisService.set( otpCooldownKey( data.email ), '1', OTP_RESEND_COOLDOWN ),
            this.mailsService.sendVerifyEmailMail( {
                name: name,
                toEmail: data.email,
                otp
            } ).catch( ( error ) =>
            {
                this.logger.error( 'Failed to send verification email,inside resendOtp service', error )
            } )
        ] )
        this.logger.info( `Verification OTP resent`, { email: data.email } )
        return {
            message: 'OTP resent successfully , please verify your email'
        }
    }


    async verifyEmail ( data: VerifyuserDto )
    {
        const cacheUser = await this.redisService.get( registerKey( data.email ) )
        if ( !cacheUser )
        {
            throw new BadRequestException( 'Sign Up Session expired, please register again' )
        }

        const otp = await this.redisService.get( otpKey( data.email ) )
        if ( !otp )
        {
            throw new BadRequestException( 'OTP expired, please request a new one' )
        }
        if ( !safeEqual( otp, data.otp ) )
        {
            throw new BadRequestException( 'Invalid OTP, please try again' )
        }
        const deleted = await this.redisService.del( otpKey( data.email ) ) // return DEL count
        if ( deleted !== 1 )
        {
            throw new BadRequestException( 'OTP already used, please request a new one' )
        }
        const user = JSON.parse( cacheUser ) as RegisteruserDto
        const createdUser = await this.authRepository.createUser( {
            email: data.email,
            name: user.name,
            password: user.password
        } )
        if ( !createdUser )
        {
            throw new BadRequestException( 'Failed to register user, please try again later' )
        }

        const { jwt, refresh } = this.createPayLoad( {
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role
        } )

        const tokenPair = await this.genarateTokenPair( jwt, refresh )
        if ( !tokenPair )
        {
            throw new BadRequestException( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair

        await Promise.all( [
            this.redisService.del( registerKey( data.email ) ),
            this.redisService.del( otpKey( data.email ) ),
            this.redisService.del( otpCooldownKey( data.email ) ),
            this.mailsService.sendWelcomeMail( {
                name: createdUser.name,
                toEmail: createdUser.email
            } ).catch( ( error ) =>
            {
                this.logger.error( 'Failed to send welcome email,inside verify email service', error )
            } )
        ] )


        this.logger.info( "User registered successfully", { email: createdUser.email } )
        return {
            message: 'User registered successfully',
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    async loginUser ( data: LoginuserDto )
    {
        const result = await this.authRepository.findUserByEmail( data.email )
        if ( !result )
        {
            throw new BadRequestException( 'User with this email does not exist' )
        }

        const isPasswordValid = await comparePassword( data.password, result.password || '' )
        if ( !isPasswordValid )
        {
            throw new BadRequestException( 'Invalid credentials,Please check your password or email' )
        }

        const { jwt, refresh } = this.createPayLoad( {
            id: result.id,
            email: result.email,
            role: result.role
        } )

        const tokenPair = await this.genarateTokenPair( jwt, refresh )
        if ( !tokenPair )
        {
            throw new BadRequestException( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair



        this.logger.info( `User logged in successfully`, { email: result.email } )
        return {
            message: 'User logged in successfully',
            accessToken: accessToken!,
            refreshToken: refreshToken!
        }
    }

    async logOutUser ( userId: string )
    {
        const result = await this.authRepository.findUserById( userId )
        if ( !result )
        {
            throw new NotFoundException( 'User with this id does not exist' )
        }
        const response = await this.authRepository.logOutUser( userId )
        if ( !response )
        {
            throw new BadRequestException( 'Failed to logout user, please try again later' )
        }
        await this.clearUserProfileCache( userId )
        this.logger.info( `User logged out successfully `, { email: result.email } )
        return {
            message: 'User logged out successfully'
        }

    }


    async refreshAccessToken ( refreshTokenData: string )
    {
        const decodedToken = await this.decodeRefreshToken( refreshTokenData )
        const result = await this.authRepository.findUserByEmail( decodedToken.email )
        if ( !result || !result.refreshToken )
        {
            throw new UnauthorizedException( 'Invalid or expired refresh token' )
        }
        if ( !safeEqual( createHashData( refreshTokenData ), result.refreshToken ) )
        {
            // Valid signature but not the current token => rotated token reused
            await this.authRepository.logOutUser( result.id )
            await this.clearUserProfileCache( result.id )
            this.logger.warn( `Refresh token reuse detected for user ${ result.email }` )
            throw new UnauthorizedException( 'Invalid or expired refresh token' )
        }

        const { jwt, refresh } = this.createPayLoad( {
            id: result.id,
            email: result.email,
            role: result.role
        } )

        const tokenPair = await this.genarateTokenPair( jwt, refresh )
        if ( !tokenPair )
        {
            throw new BadRequestException( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair
        this.logger.info( `Refreshed access token`, { email: result.email } )

        return {
            message: 'Access token refreshed successfully',
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }


    async forgotPassword ( data: ResendcodeDto )
    {
        const response = {
            message: 'If an account exists with this email, a password reset link has been sent.',
        }
        const result = await this.authRepository.findUserByEmail( data.email )
        if ( !result )
        {
            return response
        }

        const rowToken = createRowToken()
        const hashedToken = createHashData( rowToken )
        const link = ResetPasswordLink( rowToken )

        await Promise.all( [
            this.redisService.set( resetTokenKey( hashedToken ), result.email, 60 * 10 ),
            this.mailsService.sendResetPasswordMail( {
                link: link,
                toEmail: result.email,
                name: result.name
            } ).catch( ( error ) =>
            {
                this.logger.error( 'Failed to send reset password email,inside forgot password service', error )
            } )
        ] )
        this.logger.info( 'Reset password link sent', { email: result.email } )
        return response
    }

    async resetPassword ( data: ResetpasswordDto )
    {
        const invalid = () =>
        {
            return { message: 'Invalid or expired reset token' }
        }

        const hashedToken = createHashData( data.token )
        const cachedEmail = await this.redisService.get( resetTokenKey( hashedToken ) )
        if ( !cachedEmail )
        {
            throw invalid()
        }
        const result = await this.authRepository.findUserByEmail( cachedEmail )
        if ( !result )
        {
            throw invalid()
        }
        const hashedPassword = await hashPassword( data.password )
        const response = await this.authRepository.updateUserPassword( result.id, hashedPassword )
        if ( !response )
        {
            throw new BadRequestException( 'Failed to reset password, please try again later' )
        }

        await Promise.all( [
            this.redisService.del( resetTokenKey( hashedToken ) ),
            this.mailsService.sendPasswordChangedMail( {
                name: result.name,
                toEmail: result.email
            } ).catch( ( error ) =>
            {
                this.logger.error( 'Failed to send password changed email,inside reset password service', error )
            } )
        ] )
        this.logger.info( `Password reset successfully for ${ cachedEmail }` )
        return {
            message: 'Password reset successfully'
        }
    }

    async googleLogin ( data: GoogleOauthBody )
    {
        // 1. Google email verification check
        if ( !data.isEmailVerified )
        {
            throw new UnauthorizedException( 'Google account email is not verified' )
        }
        // 2. First try Google ID
        let user = await this.authRepository.findUserByGoogleId( data.googleId )
        // 3. Google ID not found
        if ( !user )
        {
            // 4. Try email
            const findbyEmail = await this.authRepository.findUserByEmail( data.email )
            if ( findbyEmail )
            {
                // 5. Verified Google email allows linking
                // Safe to link only because Google verified this email
                user = await this.authRepository.linkWithGoogleId( findbyEmail.id, data.googleId )
            } else
            {
                // 6. Completely new Google user
                try
                {
                    user = await this.authRepository.googleLogin( { ...data } )
                } catch ( error )
                {
                    // 7. Handle concurrent first login
                    // Concurrent first login: the other request already created the user
                    user = await this.authRepository.findUserByGoogleId( data.googleId )
                    if ( !user )
                    {
                        this.logger.error( 'Google signup failed', error instanceof Error ? error.stack : String( error ) )
                        throw new BadRequestException( 'Could not sign in with Google' )
                    }
                }
            }

        }

        // 8. Final safety check
        if ( !user )
        {
            throw new BadRequestException( 'Could not sign in with Google' )
        }

        // 9. Generate token pair
        const { jwt, refresh } = this.createPayLoad( {
            id: user.id,
            email: user.email,
            role: user.role
        } )
        const tokenPair = await this.genarateTokenPair( jwt, refresh )
        if ( !tokenPair )
        {
            throw new BadRequestException( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair
        this.logger.info( { email: user.email }, 'User logged in with google' )
        // 10. Return response
        return {
            success: true,
            message: 'User logged in successfully',
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

}
