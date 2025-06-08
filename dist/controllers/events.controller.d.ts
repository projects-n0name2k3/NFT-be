import { HttpStatus } from '@nestjs/common';
import { CheckEventCreationStatusDto, GetEventDetailsDto, SearchEventDto, TokenPayloadDto } from '../dto';
import { SearchEventOrganizerDto } from '../dto/search-event-organizer.dto';
import { EventsService } from '../services';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    searchEventsForUser(payload: SearchEventDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            events: any[];
            totalPages: number;
        };
    }>;
    saveEventDraft(user: TokenPayloadDto, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }, body: any): Promise<{
        status: HttpStatus;
        message: string;
    }>;
    updateEventDraft(user: TokenPayloadDto, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }, body: any, { eventId }: GetEventDetailsDto): Promise<{
        status: HttpStatus;
        message: string;
    }>;
    getUpcompingEvent(): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            events: import("../entities").Event[];
        };
    }>;
    verifyEventInformation(user: TokenPayloadDto, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }, body: any): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            _eventMetadataURL: string;
            _artists: any[];
            _tiers: any[];
            _saleRule: {
                maxTicketsPerUser: any;
                openSaleTime: number;
                endSaleTime: number;
            };
            _ticketMetadataURL: string;
        };
    }>;
    searchEventsForOrganizer(tokenPayload: TokenPayloadDto, payload: SearchEventOrganizerDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            events: import("../entities").Event[];
            totalPages: number;
        };
    }>;
    checkEventCreationStatus(tokenPayload: TokenPayloadDto, payload: CheckEventCreationStatusDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            status: string;
        };
    }>;
    deleteEventDraft(tokenPayload: TokenPayloadDto, { eventId }: GetEventDetailsDto): Promise<{
        status: HttpStatus;
        message: string;
    }>;
    getEventDetails({ eventId }: GetEventDetailsDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            event: {
                organizer: import("../entities/user.entity").User;
                location: {
                    latitude: number;
                    longitude: number;
                    locationName: string;
                };
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
                ticketTiers: import("../entities").TicketTier[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
}
