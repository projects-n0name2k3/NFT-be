import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { TicketTier } from './ticket-tier.entity';

export enum TicketSaleStatus {
  DRAFT = 'draft',
  SELLING = 'selling',
  SOLD = 'sold',
  CLOSED = 'closed',
  PENDING = 'pending',
}

@Entity('ticket_sale_transactions')
export class TicketSaleTransaction extends BaseEntity {
  @Index()
  @Column({ name: 'sale_id', type: 'integer', nullable: true, unique: true })
  saleId: number;

  @Index()
  @Column({ name: 'seller_wallet_address', nullable: false })
  sellerWalletAddress: string;

  @Index()
  @Column({ name: 'buyer_wallet_address', nullable: true })
  buyerWalletAddress: string;

  @Index()
  @Column({ name: 'transaction_hash', nullable: false })
  transactionHash: string;

  @Column({ name: 'price_per_ticket', nullable: false, type: 'decimal' })
  pricePerTicket: number;

  @Column({ type: 'integer', nullable: false })
  initialQuantity: number;

  @Column({ type: 'integer', nullable: true })
  remainingQuantity: number;

  @Index()
  @Column({
    name: 'status',
    nullable: false,
    type: 'enum',
    enum: TicketSaleStatus,
  })
  status: TicketSaleStatus;

  @Index()
  @ManyToOne(() => TicketTier, (ticketTier) => ticketTier.id)
  @JoinColumn({ name: 'tier_id' })
  ticketTier: TicketTier;
}
