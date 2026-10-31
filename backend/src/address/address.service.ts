import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { AddressRepository } from '../repository/address.repository.js';
import { RedisService } from '../redis/redis.service.js';
import { getUserAddressesKey } from '../utils/redis.key.js';
import type { SetDefaultDto } from './dto/setdefault.dto.js';

@Injectable()
export class AddressService
{
  private readonly logger = new Logger( AddressService.name );
  constructor (
    private readonly addressRepository: AddressRepository,
    private readonly redisService: RedisService
  ) { }



  async create ( createAddressDto: CreateAddressDto, userId: string )
  {
    const response = await this.addressRepository.createAddress( createAddressDto, userId );
    if ( !response )
    {
      this.logger.error( 'Failed to create address' );
      throw new BadRequestException( 'Failed to create address, please try again later' );
    }
    this.logger.log( 'Address created successfully' );
    await this.redisService.del( getUserAddressesKey( userId ) );
    return {
      message: 'Address created successfully',
      data: response
    };
  }

  async findAll ( userId: string )
  {
    const cacheData = await this.redisService.get( getUserAddressesKey( userId ) );
    if ( cacheData )
    {
      this.logger.log( 'Addresses retrieved from cache' );
      return {
        message: 'Addresses retrieved successfully',
        data: JSON.parse( cacheData )
      };
    }
    const response = await this.addressRepository.getUserAddresses( userId );
    if ( !response )
    {
      this.logger.error( 'Failed to retrieve addresses' );
      throw new BadRequestException( 'Failed to retrieve addresses, please try again later' );
    }
    await this.redisService.set( getUserAddressesKey( userId ), JSON.stringify( response ), 60 * 10 );
    this.logger.log( 'Addresses retrieved from database' );
    return {
      message: 'Addresses retrieved successfully',
      data: response
    };
  }


  async update ( addressId: string, updateAddressDto: UpdateAddressDto )
  {
    const response = await this.addressRepository.updateAddress( updateAddressDto, addressId );
    if ( !response )
    {
      this.logger.error( 'Failed to update address' );
      throw new BadRequestException( 'Failed to update address, please try again later' );
    }
    await this.redisService.del( getUserAddressesKey( response.userId ) );
    return {
      message: 'Address updated successfully',
    };
  }

  async remove ( addressId: string )
  {
    const response = await this.addressRepository.deleteAddress( addressId );
    if ( !response )
    {
      this.logger.error( 'Failed to delete address' );
      throw new BadRequestException( 'Failed to delete address, please try again later' );
    }
    await this.redisService.del( getUserAddressesKey( response.userId ) );
    return {
      message: 'Address deleted successfully',
    };
  }

  async setDefault ( addressId: string, setDefaultDto: SetDefaultDto )
  {
    const response = await this.addressRepository.setDefaultAddress( addressId, setDefaultDto.isDefault );
    if ( !response )
    {
      this.logger.error( 'Failed to set default address' );
      throw new BadRequestException( 'Failed to set default address, please try again later' );
    }
    await this.redisService.del( getUserAddressesKey( response.userId ) );
    return {
      message: 'Default address set successfully',
    };
  }
  
}
