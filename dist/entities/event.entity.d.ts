import { BaseEntity } from './baseEntity';
import { TicketTier } from './ticket-tier.entity';
import { User } from './user.entity';
import { ArtistClass } from './artist-class.entity';
import { ActionLog } from './action-log.entity';
export declare enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    PENDING = "pending",
    CANCELLED = "cancelled"
}
export declare class Event extends BaseEntity {
    onChainId: number;
    user: User;
    transactionHash: string;
    thumbnailUrl: string;
    coverPhotoUrl: string;
    name: string;
    venue: string;
    sellStartDate: Date;
    sellEndDate: Date;
    eventStartDate: Date;
    eventEndDate: Date;
    description: string;
    status: EventStatus;
    seatmapUrl: string;
    location: string;
    eventMetadataUrl: string;
    ticketMetadataUrl: string;
    searchVector: string;
    ticketAddress: string;
    maxPerUser: number;
    artistClasses: ArtistClass[];
    actionsLogs: ActionLog[];
    ticketTiers: TicketTier[];
}
