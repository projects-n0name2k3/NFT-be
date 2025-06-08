import { BaseEntity } from './baseEntity';
import { ArtistClass } from './artist-class.entity';
export declare class Artist extends BaseEntity {
    name: string;
    walletAddress: string;
    artistClass: ArtistClass;
}
