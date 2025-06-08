import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './baseEntity';

export enum BlockchainSnapshotStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('blockchain_snapshots')
export class BlockchainSnapshot extends BaseEntity {
  @Index()
  @Column({ name: 'block_number', type: 'integer', nullable: false })
  blockNumber: number;

  @Index()
  @Column({ name: 'transaction_hash', unique: true, nullable: false })
  transactionHash: string;

  @Column({ name: 'event_name', nullable: false })
  eventName: string;

  @Column({ name: 'event_data', nullable: false, type: 'json' })
  eventData: object;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BlockchainSnapshotStatus,
    nullable: false,
  })
  status: BlockchainSnapshotStatus;
}
