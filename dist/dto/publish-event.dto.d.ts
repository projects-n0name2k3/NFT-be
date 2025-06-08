import { ArtistClassDto } from '../dto/create-artist-class.dto';
import { TicketTierDto } from './create-ticket-tier.dto';
export declare class PublishEventDto {
    name: string;
    venue: string;
    sellStartDate: string;
    sellEndDate: string;
    eventStartDate: string;
    eventEndDate: string;
    description: string;
    location: string;
    maxPerUser: number;
    ticketTiers: TicketTierDto[];
    artistClasses: ArtistClassDto[];
    thumbnailUrl: string;
    coverPhotoUrl: string;
    seatmapUrl: string;
}
