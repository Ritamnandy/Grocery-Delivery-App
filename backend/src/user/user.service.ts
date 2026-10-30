import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UploadedFile } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { ImageService } from '../image/image.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class UserService
{
    private readonly logger = new Logger( UserService.name )
    private readonly userCacheTTL = 60 * 10; // 10 minutes
    private userCacheKey ( userId: string )
    {
        return `user:${ userId }`;
    }
    constructor (
        private readonly userRepository: UserRepository,
        private readonly imageService: ImageService,
        private readonly redisService: RedisService
    ) { }

    async gerCurrentUser ( userId: string )
    {
        const cachedUser = await this.redisService.get( this.userCacheKey( userId ) )
        if ( cachedUser )
        {
            this.logger.log( `User found in cache: ${ userId }` )
            return {
                message: 'User found',
                user: JSON.parse( cachedUser )
            }
        }

        const response = await this.userRepository.getUserById( userId )
        if ( !response )
        {
            throw new NotFoundException( 'User with this ID not found' )
        }
        this.logger.log( `User found: ${ response.name }` )
        const user = {
            id: response.id,
            name: response.name,
            email: response.email,
            role: response.role,
            avatar: response.avatar
        }
        await this.redisService.set( this.userCacheKey( userId ), JSON.stringify( user ), this.userCacheTTL )
        return {
            message: 'User found',
            user: user
        }
    }

    async setUserImages ( userId: string, @UploadedFile() file: Express.Multer.File )
    {
        const imageResult = await this.imageService.uploadImage( file, '/user-profile/image' );
        if ( !imageResult || !imageResult.url || !imageResult.fileId )
        {
            throw new ConflictException( 'Failed to upload image, please try again later' );
        }

        const response = await this.userRepository.setUserProfileImage( userId, imageResult.url, imageResult.fileId )

        if ( !response )
        {
            throw new BadRequestException( 'Failed to set user profile image, please try again later' )

        }
        await this.redisService.del( this.userCacheKey( userId ) )
        return {
            message: 'User profile image set successfully',
        }
    }

    



}
