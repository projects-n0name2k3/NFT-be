import { ConfigService } from '@nestjs/config';
import { CheckEventCreationStatusDto, CreateEventDraftDto, GetEventMarketplaceDto, PublishEventDto, SearchEventDto, TokenPayloadDto } from '../dto';
import { ArtistClass, Event, TicketTier, User } from '../entities';
import { EventStatus } from '../entities/event.entity';
import { Repository } from 'typeorm';
import { ArtistClassesService } from './artist-classes.service';
import { FilesService } from './files.service';
import { IpfsService } from './ipfs.service';
import { TicketTiersService } from './ticket-tiers.service';
import { ArtistsService } from './artists.service';
import { BlockchainSnapshotsService } from './blockchain-snapshots.service';
import { NftTicketsService } from './nft-tickets.service';
import { SCService } from '../services/sc.service';
export declare class EventsService {
    private readonly eventRepository;
    private readonly userRepository;
    private readonly configService;
    private readonly ticketTiersService;
    private readonly ipfsService;
    private readonly filesService;
    private readonly artistClassesService;
    private readonly artistsService;
    private readonly nftTicketService;
    private readonly blockchainSnapshotsService;
    private readonly scService;
    constructor(eventRepository: Repository<Event>, userRepository: Repository<User>, configService: ConfigService, ticketTiersService: TicketTiersService, ipfsService: IpfsService, filesService: FilesService, artistClassesService: ArtistClassesService, artistsService: ArtistsService, nftTicketService: NftTicketsService, blockchainSnapshotsService: BlockchainSnapshotsService, scService: SCService);
    searchEventsForUser({ value, page, limit, minPrice, maxPrice, startDate, endDate, }: SearchEventDto): Promise<{
        events: any[];
        totalPages: number;
    }>;
    searchEventsForUserWithValue(value: string, page: number, limit: number, minPrice?: number, maxPrice?: number, startDate?: string, endDate?: string): Promise<{
        events: any[];
        totalPages: number;
    }>;
    searchEventsForUserWithoutValue(page: number, limit: number, minPrice?: number, maxPrice?: number, startDate?: string, endDate?: string): Promise<{
        events: any[];
        totalPages: number;
    }>;
    createEventDraft(user: TokenPayloadDto, createEventDto: CreateEventDraftDto, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }): Promise<{
        savedEvent: Event;
        ticketTiers: TicketTier[];
        artistClasses: void;
    }>;
    createEventDraftRecord(eventInput: Event, createEventDto: CreateEventDraftDto): Promise<{
        savedEvent: Event;
        ticketTiers: TicketTier[];
        artistClasses: void;
    }>;
    uploadFileCreateEvent(files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }): Promise<{
        thumbnailFile: string | undefined;
        coverPhotoFile: string | undefined;
        seatmapFile: string | undefined;
    }>;
    saveEventsDraft(user: TokenPayloadDto, createEventDto: CreateEventDraftDto, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }): Promise<void>;
    updateEventDraft(eventId: string, user: TokenPayloadDto, updateEventDto: any, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }): Promise<{
        savedEvent: Event;
        ticketTiers: TicketTier[];
        artistClasses: void;
    }>;
    parseArrayTicketTierAndArtistClass(body: any): Promise<PublishEventDto>;
    verifyEventDraft(payload: string): Promise<CreateEventDraftDto>;
    getUpcompingEvent(): Promise<Event[]>;
    verifyEventInformation(user: TokenPayloadDto, payload: any, files: {
        thumbnailFile?: Express.Multer.File;
        coverPhotoFile?: Express.Multer.File;
        seatmapFile?: Express.Multer.File;
    }): Promise<{
        _eventMetadataURL: string;
        _artists: any[];
        _tiers: any[];
        _saleRule: {
            maxTicketsPerUser: any;
            openSaleTime: number;
            endSaleTime: number;
        };
        _ticketMetadataURL: string;
    }>;
    deleteDraftEvent(eventId: string, userId: string, unRemovedFileUrls?: string[]): Promise<void>;
    getEventDetails(eventId: string): Promise<{
        organizer: User;
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
        status: EventStatus;
        seatmapUrl: string;
        eventMetadataUrl: string;
        ticketMetadataUrl: string;
        searchVector: string;
        ticketAddress: string;
        maxPerUser: number;
        artistClasses: ArtistClass[];
        actionsLogs: import("../entities").ActionLog[];
        ticketTiers: TicketTier[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    searchEventsForOrganizer(tokenPayload: TokenPayloadDto, value: string, page?: number, limit?: number): Promise<{
        events: Event[];
        totalPages: number;
    }>;
    searchEventsForOrganizerWithValue({ userId }: TokenPayloadDto, value: string, page: number, limit: number): Promise<{
        events: Event[];
        totalPages: number;
    }>;
    searchEventsForOrganizerWithoutValue({ userId }: TokenPayloadDto, page: number, limit: number): Promise<{
        events: Event[];
        totalPages: number;
    }>;
    deleteEvent(eventId: string, unRemovedFileUrls?: string[]): Promise<{
        message: string;
    }>;
    checkEventCreationStatus({ userId }: TokenPayloadDto, { eventMetadataUrl, transactionHash }: CheckEventCreationStatusDto): Promise<EventStatus.PUBLISHED | EventStatus.PENDING>;
    getEventsForMarketplace({ value, page, limit, startDate, endDate, minPrice, maxPrice, }: GetEventMarketplaceDto): Promise<{
        events: any[];
        total: number;
    } | {
        events: any[];
        totalPages: number;
    } | undefined>;
    getEventsForMarketplaceWithoutValue(page: number, limit: number, startDate?: string, endDate?: string, minPrice?: number, maxPrice?: number): Promise<{
        events: any[];
        totalPages: number;
    }>;
    getEventsForMarketplaceWithValue(value: string, page: number, limit: number, startDate?: string, endDate?: string, minPrice?: number, maxPrice?: number): Promise<{
        events: any[];
        total: number;
    } | undefined>;
}
