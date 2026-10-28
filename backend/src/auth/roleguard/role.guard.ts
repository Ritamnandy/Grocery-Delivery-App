import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../../generated/prisma/enums.js';
import { ROLES_KEY } from '../roledecorator/role.decorator.js';
import type { AuthenticatedRequest } from '../../types/auth-request.type.js';
import  { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate
{
  constructor ( private readonly reflector: Reflector ) { }

  canActivate (
    context: ExecutionContext,
  ): boolean 
  {

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>( ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ] );


    if ( !requiredRoles )
    {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return requiredRoles.some( ( role: string ) => user.role?.includes( role ) );
  }
}
