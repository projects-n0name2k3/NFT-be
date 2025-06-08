import { HttpStatus } from '@nestjs/common';
import { GetEventDetailsDto, GetEventMarketplaceDto } from '../dto';
import { EventsService, NftTicketsService } from '../services';
import { GetResaleTicketDto } from '../dto/get-resale-ticket.dto';
export declare class MarketplaceController {
    private readonly eventsService;
    private readonly nftTicketsService;
    constructor(eventsService: EventsService, nftTicketsService: NftTicketsService);
    getEventsForMarketPlace(payload: GetEventMarketplaceDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {};
    }>;
    getResaleTicket({ eventId }: GetEventDetailsDto, query: GetResaleTicketDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            event: {
                organizer: import("../entities").User;
                location: {
                    latitude: number;
                    longitude: number;
                    locationName: string;
                };
                ticketTiers: {
                    name: string;
                    id: any;
                    tickets: any[];
                }[];
                onChainId: number;
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
                status: import("../entities/event.entity").EventStatus;
                seatmapUrl: string;
                eventMetadataUrl: string;
                ticketMetadataUrl: string;
                searchVector: string;
                ticketAddress: string;
                maxPerUser: number;
                artistClasses: import("../entities").ArtistClass[];
                actionsLogs: import("../entities").ActionLog[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
}
