import { BaseEntity } from './baseEntity';
import { User } from './user.entity';
export declare class RefreshToken extends BaseEntity {
    token: string;
    expiredAt: Date;
    isRevoked: boolean;
    user: User;
}
