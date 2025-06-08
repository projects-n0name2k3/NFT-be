import { BaseEntity } from './baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ArtistClass } from './artist-class.entity';

@Entity('artists')
export class Artist extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ name: 'wallet_address', nullable: false })
  walletAddress: string;

  @ManyToOne(() => ArtistClass, (artistClass) => artistClass.id)
  @JoinColumn({ name: 'class_id' })
  artistClass: ArtistClass;
}
