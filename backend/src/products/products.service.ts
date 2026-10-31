import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsRepository } from '../repository/products.repository.js';
import { RedisService } from '../redis/redis.service.js';
import { FlashDealsKey, getAllProductsKey } from '../utils/redis.key.js';
import { ImageService } from '../image/image.service.js';

@Injectable()
export class ProductsService
{
  private readonly logger = new Logger( ProductsService.name );

  constructor ( private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
    private readonly imageService: ImageService
  ) { }

  async create ( createProductDto: CreateProductDto, file: Express.Multer.File, )
  {
    const imageResponse = await this.imageService.uploadImage( file, 'products' );
    if ( !imageResponse || !imageResponse.url || !imageResponse.fileId )
    {
      this.logger.error( 'Failed to upload image' );
      throw new ConflictException( 'Failed to upload image, please try again later' );
    }
    const response = await this.productsRepository.createProduct( createProductDto, imageResponse.url, imageResponse.fileId );

    if ( !response )
    {
      this.logger.error( 'Failed to create product' );
      throw new ConflictException( 'Failed to create product, please try again later' );
    }
    this.logger.log( 'Product created successfully' );
    await this.redisService.del( FlashDealsKey );
    await this.redisService.del( getAllProductsKey );
    return {
      message: 'Product created successfully',
    };
  }


  async update ( productId: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File )
  {
    if ( !file )
    {
      const response = await this.productsRepository.updateProductWithoutImage( productId, updateProductDto )
      if ( !response )
      {
        this.logger.error( 'Failed to update product' );
        throw new ConflictException( 'Failed to update product, please try again later' );
      }
      this.logger.log( 'Product updated successfully' );
      await this.redisService.del( FlashDealsKey );
      await this.redisService.del( getAllProductsKey );
      return {
        message: 'Product updated successfully',
      };
    }
    const imageResponse = await this.imageService.uploadImage( file, 'products' );
    if ( !imageResponse || !imageResponse.url || !imageResponse.fileId )
    {
      this.logger.error( 'Failed to upload image' );
      throw new ConflictException( 'Failed to upload image, please try again later' );
    }
    const response = await this.productsRepository.updateProductWithImage( productId, updateProductDto, imageResponse.url, imageResponse.fileId );
    if ( !response )
    {
      this.logger.error( 'Failed to update product' );
      throw new ConflictException( 'Failed to update product, please try again later' );
    }
    this.logger.log( 'Product updated successfully' );
    await this.redisService.del( FlashDealsKey );
    await this.redisService.del( getAllProductsKey );
    return {
      message: 'Product updated successfully',
    };
  }

  async remove ( productId: string )
  {
    const response = await this.productsRepository.deleteProduct( productId );
    if ( !response )
    {
      this.logger.error( 'Failed to remove product' );
      throw new ConflictException( 'Failed to remove product, please try again later' );
    }
    this.logger.log( 'Product removed successfully' );
    await this.redisService.del( FlashDealsKey );
    await this.redisService.del( getAllProductsKey );
    return {
      message: 'Product removed successfully',
    };
  }

  async getFlashDeals ()
  {
    const cachedData = await this.redisService.get( FlashDealsKey );
    if ( cachedData )
    {
      this.logger.log( 'Returning cached flash deals' );
      return {
        message: 'Flash deals found',
        data: JSON.parse( cachedData )
      }
    }
    const response = await this.productsRepository.getFlashDeals();
    if ( !response || response.length === 0 )
    {
      this.logger.warn( 'No flash deals found' );
      return {
        message: 'No flash deals found',
        data: []
      };
    }
    const productsWithDiscount = response.map( ( p ) =>
    {
      const discount = p.originalPrice && p.price ? (
        ( ( p.originalPrice - p.price ) / p.originalPrice ) * 100
      ).toFixed( 2 ) : 0;

      return {
        ...p,
        discount
      };
    } );
    await this.redisService.set( FlashDealsKey, JSON.stringify( productsWithDiscount.slice( 0, 8 ) ), 60 * 10 ); // 10 minutes
    return {
      message: 'Flash deals found',
      data: productsWithDiscount.slice( 0, 8 )
    };
  }

  async findAll ()
  {
    const cachedData = await this.redisService.get( getAllProductsKey );
    if ( cachedData )
    {
      this.logger.log( 'Returning cached products' );
      return {
        message: 'Products found',
        data: JSON.parse( cachedData )
      }
    }
    const response = await this.productsRepository.findAllProducts();
    if ( !response || response.length === 0 )
    {
      this.logger.warn( 'No products found' );
      await this.redisService.set( getAllProductsKey, JSON.stringify( [] ), 60 * 10 ); // 10 minutes
      return {
        message: 'No products found',
        data: []
      };
    }
    await this.redisService.set( getAllProductsKey, JSON.stringify( response ), 60 * 10 ); // 10 minutes
    return {
      message: 'Products found',
      data: response
    };
  }



}
