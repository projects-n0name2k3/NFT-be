import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

export const Role = (role: UserRole) => SetMetadata('role', role);
