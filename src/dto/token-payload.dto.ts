import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class TokenPayloadDto {
  @IsString()
  userId: string;

  @IsString()
  walletAddress: string;

  @IsEnum(UserRole)
  role: UserRole;
}
