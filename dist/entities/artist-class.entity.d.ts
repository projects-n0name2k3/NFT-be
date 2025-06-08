import { BaseEntity } from './baseEntity';
import { Artist } from './artist.entity';
import { Event } from './event.entity';
export declare class ArtistClass extends BaseEntity {
    name: string;
    royaltyPercentage: number;
    event: Event;
    artists: Artist[];
}
