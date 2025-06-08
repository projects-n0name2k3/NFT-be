import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Event } from './event.entity';
import { NftTicket } from './nft-ticket.entity';
import { TicketSaleTransaction } from './ticket-sale-transaction.entity';

@Entity('ticket_tiers')
export class TicketTier extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column({ name: 'total_supply', type: 'integer', nullable: false })
  totalSupply: number;

  @Column({ name: 'available_supply', type: 'integer', nullable: false })
  availableSupply: number;

  @Column({ name: 'max_resale_price', type: 'integer', nullable: true })
  maxResalePrice: number;

  @Column({ name: 'min_resale_price', type: 'integer', nullable: true })
  minResalePrice: number;

  @Column({ name: 'royalty_percentage', type: 'integer', nullable: false })
  royaltyPercentage: number;

  @Column({ name: 'tier_index', type: 'integer', nullable: true })
  tierIndex: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Index()
  @ManyToOne(() => Event, (event) => event.id)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => NftTicket, (nftTicket) => nftTicket.ticketTier)
  nftTickets: NftTicket[];

  @OneToMany(
    () => TicketSaleTransaction,
    (ticketSaleTransaction) => ticketSaleTransaction.ticketTier,
  )
  ticketSaleTransactions: TicketSaleTransaction[];
}
