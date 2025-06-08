import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './baseEntity';
import { TicketTier } from './ticket-tier.entity';
import { User } from './user.entity';
import { ArtistClass } from './artist-class.entity';
import { ActionLog } from './action-log.entity';
import { BlockchainSnapshot } from './blockchain-snapshot.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event extends BaseEntity {
  @Index()
  @Column({ name: 'on_chain_id', type: 'bigint', unique: true, nullable: true })
  onChainId: number;

  @Index()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'organizer_id' })
  user: User;

  @Index()
  @Column({ name: 'transaction_hash', nullable: true })
  transactionHash: string;

  @Column({ name: 'thumbnail_url', nullable: false })
  thumbnailUrl: string;

  @Column({ name: 'cover_photo_url', nullable: false })
  coverPhotoUrl: string;

  @Index()
  @Column({ nullable: false })
  name: string;

  @Index()
  @Column({ nullable: false })
  venue: string;

  @Index()
  @Column({ name: 'sell_start_date', type: 'timestamp', nullable: false })
  sellStartDate: Date;

  @Index()
  @Column({ name: 'sell_end_date', type: 'timestamp', nullable: false })
  sellEndDate: Date;

  @Index()
  @Column({ name: 'event_start_date', type: 'timestamp', nullable: false })
  eventStartDate: Date;

  @Index()
  @Column({ name: 'event_end_date', type: 'timestamp', nullable: false })
  eventEndDate: Date;

  @Column({ nullable: false })
  description: string;

  @Index()
  @Column({ type: 'enum', enum: EventStatus, nullable: false })
  status: EventStatus;

  @Column({ name: 'seatmap_url', nullable: false })
  seatmapUrl: string;

  @Column({ nullable: false })
  location: string;

  @Column({ name: 'event_metadata_url', nullable: true })
  eventMetadataUrl: string;

  @Column({ name: 'ticket_metadata_url', nullable: true })
  ticketMetadataUrl: string;

  @Index('search_vector_idx')
  @Column({
    type: 'tsvector',
    name: 'search_vector',
    generatedType: 'STORED',
    asExpression: "to_tsvector('simple', name)",
    nullable: true,
  })
  searchVector: string;

  @Column({ name: 'ticket_address', nullable: true })
  ticketAddress: string;

  @Column({ name: 'max_per_user', type: 'integer', nullable: true })
  maxPerUser: number;

  @OneToMany(() => ArtistClass, (artistClass) => artistClass.event)
  artistClasses: ArtistClass[];

  @OneToMany(() => ActionLog, (actionLog) => actionLog.event)
  actionsLogs: ActionLog[];

  @OneToMany(() => TicketTier, (ticketTier) => ticketTier.event)
  ticketTiers: TicketTier[];
}
