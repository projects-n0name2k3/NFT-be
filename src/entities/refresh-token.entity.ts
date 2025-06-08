import { BaseEntity } from './baseEntity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh-tokens')
export class RefreshToken extends BaseEntity {
  @Index()
  @Column({ nullable: false })
  token: string;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: false })
  expiredAt: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @Index()
  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
