import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = [UserRole.USER, UserRole.ORGANIZER];

    const requiredRoles = this.reflector.get<UserRole>(
      'role',
      context.getHandler(),
    );

    const isValidate = validRoles.includes(requiredRoles);

    if (!isValidate) {
      throw new InternalServerErrorException('Invalid role');
    }

    if (!requiredRoles) {
      throw new InternalServerErrorException('Role not found');
    }

    const { user } = context.switchToHttp().getRequest();

    if (user.role !== requiredRoles) {
      throw new UnauthorizedException('User role not authorized');
    }

    return true;
  }
}
