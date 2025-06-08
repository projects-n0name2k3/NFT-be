import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../entities/baseEntity';
import { Event } from '../entities/event.entity';
import { OrganizerDetail } from '../entities/organizer-detail.entity';
import { ActionLog } from '../entities/action-log.entity';
import { TicketSaleTransaction } from '../entities/ticket-sale-transaction.entity';
import { NftTicket } from '../entities/nft-ticket.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
}

@Entity('users')
export class User extends BaseEntity {
  @Index()
  @Column({ name: 'wallet_address', unique: true, nullable: false })
  walletAddress: string;

  @Column({ default: 'Unnamed' })
  name: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'cover_photo_url', nullable: true })
  coverPhotoUrl: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToOne(() => OrganizerDetail, (organizerDetail) => organizerDetail.user)
  organzierDetail: OrganizerDetail;

  @OneToMany(() => ActionLog, (actionLog) => actionLog.user)
  actionLogs: ActionLog[];

  @OneToMany(
    () => TicketSaleTransaction,
    (ticketResaleTransaction) => ticketResaleTransaction.sellerWalletAddress,
  )
  ticketSellTransactions: TicketSaleTransaction[];

  @OneToMany(
    () => TicketSaleTransaction,
    (ticketResaleTransaction) => ticketResaleTransaction.buyerWalletAddress,
  )
  ticketBuyTransactions: TicketSaleTransaction[];

  @OneToMany(() => NftTicket, (nftTicket) => nftTicket.owner)
  nftTickets: NftTicket[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
