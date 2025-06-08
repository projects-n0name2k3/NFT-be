import { BaseEntity } from './baseEntity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TicketTier } from './ticket-tier.entity';
import { User } from './user.entity';

@Entity('nft_tickets')
export class NftTicket extends BaseEntity {
  @Index()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  @ManyToOne(() => TicketTier, (ticketTier) => ticketTier.id)
  @JoinColumn({ name: 'tier_id' })
  ticketTier: TicketTier;
}
