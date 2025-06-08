import { UserRole } from '../entities/user.entity';
export declare class TokenPayloadDto {
    userId: string;
    walletAddress: string;
    role: UserRole;
}
