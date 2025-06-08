import { BaseEntity } from './baseEntity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Artist } from './artist.entity';
import { Event } from './event.entity';

@Entity('artist_classes')
export class ArtistClass extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({
    name: 'royalty_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
  })
  royaltyPercentage: number;

  @Index()
  @ManyToOne(() => Event, (event) => event.id)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Artist, (artist) => artist.artistClass)
  artists: Artist[];
}
