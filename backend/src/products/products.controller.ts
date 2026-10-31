import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/authguard/auth.guard.js';
import { Roles } from '../auth/roledecorator/role.decorator.js';
import { UserRole } from '../generated/prisma/enums.js';
import { Throttle } from '@nestjs/throttler';
import { RoleGuard } from '../auth/roleguard/role.guard.js';

@Controller( 'products' )
@UseGuards( AuthGuard )
@Throttle( {
  default: {
    limit: 30, // limit each IP to 5 requests per `window`
    ttl: 60_000,
  },
} )
export class ProductsController
{
  constructor ( private readonly productsService: ProductsService ) { }

  @Throttle( {
    default: {
      limit: 10, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post()
  @HttpCode( HttpStatus.CREATED )
  @UseGuards( RoleGuard )
  @Roles( UserRole.admin )
  @UseInterceptors(
    FileInterceptor( 'productImage' ),
  )
  async create ( @Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File )
  {
    console.log( file );
    return await this.productsService.create( createProductDto, file );
  }

  @Get()
  @HttpCode( HttpStatus.OK )
  async findAll ()
  {
    return await this.productsService.findAll();
  }

  @Throttle( {
    default: {
      limit: 10, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Patch( ':id' )
  @HttpCode( HttpStatus.OK )
  @UseGuards( RoleGuard )
  @Roles( UserRole.admin )
  @UseInterceptors(
    FileInterceptor( 'productImage' ),
  )
  async update ( @Param( 'id' ) id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFile() file: Express.Multer.File )
  {
    return await this.productsService.update( id, updateProductDto, file ?? null );
  }

  @Delete( ':id' )
  @HttpCode( HttpStatus.OK )
  @UseGuards( RoleGuard )
  @Roles( UserRole.admin )
  async remove ( @Param( 'id' ) id: string )
  {
    return await this.productsService.remove( id );
  }

  @Get('flash-deals')
  @HttpCode( HttpStatus.OK )
  async getFlashDeals ()
  {
    return await this.productsService.getFlashDeals();
  }


}
