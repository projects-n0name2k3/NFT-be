import { ArtistClassDto } from '../dto/create-artist-class.dto';
import { TicketTierDto } from './create-ticket-tier.dto';
export declare class CreateEventDraftDto {
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
}
