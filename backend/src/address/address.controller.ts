import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AddressService } from './address.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/authguard/auth.guard.js';
import type { AuthenticatedRequest } from '../types/auth-request.type.js';
import { Throttle } from '@nestjs/throttler';
import type { SetDefaultDto } from './dto/setdefault.dto.js';

@Controller( 'address' )
@UseGuards( AuthGuard )
@Throttle( {
  default: {
    limit: 30, // limit each IP to 5 requests per `window`
    ttl: 60_000,
  },
} )
export class AddressController
{
  constructor ( private readonly addressService: AddressService ) { }

  @Post()
  async create ( @Body() createAddressDto: CreateAddressDto, @Req() req: AuthenticatedRequest )
  {
    const response = await this.addressService.create( createAddressDto, req.user.id );
    return { message: response.message, data: response.data };
  }

  @Get()
  async findAll ( @Req() req: AuthenticatedRequest )
  {
    const response = await this.addressService.findAll( req.user.id );
    return { message: response.message, data: response.data };
  }


  @Patch( ':id' )
  async update ( @Param( 'id' ) id: string, @Body() updateAddressDto: UpdateAddressDto )
  {
    const response = await this.addressService.update( id, updateAddressDto );
    return { message: response.message };
  }

  @Delete( ':id' )
  async remove ( @Param( 'id' ) id: string )
  {
    const response = await this.addressService.remove( id );
    return { message: response.message };
  }

  @Patch( ':id/default' )
  async setDefault ( @Param( 'id' ) id: string, @Body() setDefaultDto: SetDefaultDto )
  {
    const response = await this.addressService.setDefault( id, setDefaultDto );
    return { message: response.message };
  }
}
