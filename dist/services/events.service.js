"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const dto_1 = require("../dto");
const entities_1 = require("../entities");
const event_entity_1 = require("../entities/event.entity");
const typeorm_2 = require("typeorm");
const artist_classes_service_1 = require("./artist-classes.service");
const files_service_1 = require("./files.service");
const ipfs_service_1 = require("./ipfs.service");
const ticket_tiers_service_1 = require("./ticket-tiers.service");
const artists_service_1 = require("./artists.service");
const blockchain_snapshots_service_1 = require("./blockchain-snapshots.service");
const nft_tickets_service_1 = require("./nft-tickets.service");
const ticket_sale_transaction_entity_1 = require("../entities/ticket-sale-transaction.entity");
const sc_service_1 = require("../services/sc.service");
let EventsService = class EventsService {
    eventRepository;
    userRepository;
    configService;
    ticketTiersService;
    ipfsService;
    filesService;
    artistClassesService;
    artistsService;
    nftTicketService;
    blockchainSnapshotsService;
    scService;
    constructor(eventRepository, userRepository, configService, ticketTiersService, ipfsService, filesService, artistClassesService, artistsService, nftTicketService, blockchainSnapshotsService, scService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.configService = configService;
        this.ticketTiersService = ticketTiersService;
        this.ipfsService = ipfsService;
        this.filesService = filesService;
        this.artistClassesService = artistClassesService;
        this.artistsService = artistsService;
        this.nftTicketService = nftTicketService;
        this.blockchainSnapshotsService = blockchainSnapshotsService;
        this.scService = scService;
    }
    async searchEventsForUser({ value, page = 1, limit = 8, minPrice, maxPrice, startDate, endDate, }) {
        const formattedStartDate = startDate
            ? new Date(startDate).toISOString()
            : undefined;
        const formattedEndDate = endDate
            ? new Date(endDate).toISOString()
            : undefined;
        return value
            ? this.searchEventsForUserWithValue(value, page, limit, minPrice, maxPrice, formattedStartDate, formattedEndDate)
            : this.searchEventsForUserWithoutValue(page, limit, minPrice, maxPrice, formattedStartDate, formattedEndDate);
    }
    async searchEventsForUserWithValue(value, page, limit, minPrice, maxPrice, startDate, endDate) {
        console.log(minPrice, maxPrice, startDate, endDate, value);
        const searchQuery = value
            .split(' ')
            .map((word) => `${word}:*`)
            .join(' & ');
        const currentDate = new Date();
        const skip = (page - 1) * limit;
        const query = this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.user', 'user')
            .leftJoin('event.ticketTiers', 'ticketTiers')
            .select([
            'event.id AS "id"',
            'event.name AS "name"',
            'event.event_start_date AS "eventStartDate"',
            'event.event_end_date AS "eventEndDate"',
            'event.thumbnail_url AS "eventThumbnailUrl"',
            'event.location AS "location"',
            'event.venue AS "venue"',
            'MIN(ticketTiers.price) AS "minPrice"',
            'MAX(ticketTiers.price) AS "maxPrice"',
            'user.name AS "organizerName"',
            'user.thumbnail_url AS "organizerThumbnailUrl"',
        ])
            .where('event.sell_end_date >= :currentDate', { currentDate })
            .andWhere('event.status = :draftStatus', {
            draftStatus: 'published',
        })
            .andWhere('event.name ILIKE :value OR user.name ILIKE :value', {
            value: `%${value}%`,
        })
            .andWhere("event.search_vector @@ to_tsquery('simple', :searchQuery) OR " +
            "to_tsvector('simple', user.name) @@ to_tsquery('simple', :searchQuery)", { searchQuery });
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.andWhere('ticketTiers.price BETWEEN :minPrice AND :maxPrice', {
                minPrice,
                maxPrice,
            });
        }
        else if (minPrice !== undefined) {
            query.andWhere('ticketTiers.price >= :minPrice', { minPrice });
        }
        else if (maxPrice !== undefined) {
            query.andWhere('ticketTiers.price <= :maxPrice', { maxPrice });
        }
        if (startDate !== undefined && endDate !== undefined) {
            query.andWhere('event.event_start_date >= :startDate AND event.event_end_date <= :endDate', { startDate, endDate });
        }
        else if (startDate !== undefined) {
            query.andWhere('event.event_start_date = :startDate', { startDate });
        }
        else if (endDate !== undefined) {
            query.andWhere('event.event_end_date = :endDate', { endDate });
        }
        query
            .orderBy("ts_rank(event.search_vector, to_tsquery('english', :searchQuery)) + " +
            "ts_rank(to_tsvector('english', user.name), to_tsquery('english', :searchQuery))", 'DESC')
            .addOrderBy(`ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`, 'ASC')
            .addOrderBy(`ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`, 'ASC')
            .groupBy('event.id')
            .addGroupBy('event.name')
            .addGroupBy('event.event_start_date')
            .addGroupBy('event.event_end_date')
            .addGroupBy('event.thumbnail_url')
            .addGroupBy('event.location')
            .addGroupBy('event.venue')
            .addGroupBy('user.name')
            .addGroupBy('user.thumbnail_url')
            .setParameter('currentDate', currentDate)
            .offset(skip)
            .limit(limit);
        const [events, total] = await Promise.all([
            query.getRawMany(),
            query.getCount(),
        ]);
        const formatedEvents = events.map((event) => {
            const locationObject = event.location.split(' ');
            const latitude = +locationObject[locationObject.length - 2];
            const longitude = +locationObject[locationObject.length - 1];
            const locationName = locationObject.slice(0, -2).join(' ');
            event.location = {
                latitude,
                longitude,
                locationName,
            };
            return event;
        });
        return { events: formatedEvents, totalPages: Math.ceil(total / limit) };
    }
    async searchEventsForUserWithoutValue(page, limit, minPrice, maxPrice, startDate, endDate) {
        const currentDate = new Date();
        const skip = (page - 1) * limit;
        const query = this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.user', 'user')
            .leftJoin('event.ticketTiers', 'ticketTiers')
            .select([
            'event.id AS "id"',
            'event.name AS "name"',
            'event.event_start_date AS "eventStartDate"',
            'event.event_end_date AS "eventEndDate"',
            'event.thumbnail_url AS "eventThumbnailUrl"',
            'event.location AS "location"',
            'event.venue AS "venue"',
            'MIN(ticketTiers.price) AS "minPrice"',
            'MAX(ticketTiers.price) AS "maxPrice"',
            'user.name AS "organizerName"',
            'user.thumbnail_url AS "organizerThumbnailUrl"',
        ])
            .where('event.status = :status', { status: event_entity_1.EventStatus.PUBLISHED })
            .andWhere('event.event_end_date >= :currentDate', { currentDate });
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.andWhere('ticketTiers.price BETWEEN :minPrice AND :maxPrice', {
                minPrice,
                maxPrice,
            });
        }
        else if (minPrice !== undefined) {
            query.andWhere('ticketTiers.price >= :minPrice', { minPrice });
        }
        else if (maxPrice !== undefined) {
            query.andWhere('ticketTiers.price <= :maxPrice', { maxPrice });
        }
        if (startDate !== undefined && endDate !== undefined) {
            query.andWhere('event.event_start_date >= :startDate AND event.event_end_date <= :endDate', { startDate, endDate });
        }
        else if (startDate !== undefined) {
            query.andWhere('event.event_start_date = :startDate', { startDate });
        }
        else if (endDate !== undefined) {
            query.andWhere('event.event_end_date = :endDate', { endDate });
        }
        query
            .orderBy(`ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`, 'ASC')
            .addOrderBy(`ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`, 'ASC')
            .groupBy('event.id')
            .addGroupBy('event.name')
            .addGroupBy('event.event_start_date')
            .addGroupBy('event.event_end_date')
            .addGroupBy('event.thumbnail_url')
            .addGroupBy('event.location')
            .addGroupBy('event.venue')
            .addGroupBy('user.name')
            .addGroupBy('user.thumbnail_url')
            .setParameter('currentDate', currentDate)
            .offset(skip)
            .limit(limit);
        const [events, total] = await Promise.all([
            query.getRawMany(),
            query.getCount(),
        ]);
        const formatedEvents = events.map((event) => {
            const locationObject = event.location.split(' ');
            const latitude = +locationObject[locationObject.length - 2];
            const longitude = +locationObject[locationObject.length - 1];
            const locationName = locationObject.slice(0, -2).join(' ');
            event.location = {
                latitude,
                longitude,
                locationName,
            };
            return event;
        });
        return { events: formatedEvents, totalPages: Math.ceil(total / limit) };
    }
    async createEventDraft(user, createEventDto, files) {
        const userData = await this.userRepository.findOne({
            where: { id: user.userId },
        });
        if (!userData) {
            throw new common_1.BadRequestException('UserId is invalid');
        }
        const uploadedFiles = files.thumbnailFile || files.coverPhotoFile || files.seatmapFile
            ? await this.uploadFileCreateEvent(files)
            : {};
        const eventInput = this.eventRepository.create({
            thumbnailUrl: uploadedFiles.thumbnailFile,
            coverPhotoUrl: uploadedFiles.coverPhotoFile,
            seatmapUrl: uploadedFiles.seatmapFile,
            status: event_entity_1.EventStatus.DRAFT,
            name: createEventDto.name,
            venue: createEventDto.venue,
            sellStartDate: createEventDto.sellStartDate,
            sellEndDate: createEventDto.sellEndDate,
            eventStartDate: createEventDto.eventStartDate,
            eventEndDate: createEventDto.eventEndDate,
            description: createEventDto.description,
            location: createEventDto.location,
            user: userData,
            maxPerUser: createEventDto.maxPerUser,
        });
        return this.createEventDraftRecord(eventInput, createEventDto);
    }
    async createEventDraftRecord(eventInput, createEventDto) {
        const savedEvent = await this.eventRepository.save(eventInput);
        const ticketTiers = await this.ticketTiersService.createTicketTiers(savedEvent.id, createEventDto.ticketTiers);
        const artistClasses = await this.artistClassesService.createArtistClasses(savedEvent.id, createEventDto.artistClasses);
        return { savedEvent, ticketTiers, artistClasses };
    }
    async uploadFileCreateEvent(files) {
        console.log(files);
        const [thumbnailFile, coverPhotoFile, seatmapFile] = await Promise.all([
            files.thumbnailFile?.[0]
                ? this.filesService.uploadImage(files.thumbnailFile[0])
                : null,
            files.coverPhotoFile?.[0]
                ? this.filesService.uploadImage(files.coverPhotoFile[0])
                : null,
            files.seatmapFile?.[0]
                ? this.filesService.uploadImage(files.seatmapFile[0])
                : null,
        ]);
        return {
            thumbnailFile: thumbnailFile || undefined,
            coverPhotoFile: coverPhotoFile || undefined,
            seatmapFile: seatmapFile || undefined,
        };
    }
    async saveEventsDraft(user, createEventDto, files) {
        const existingDraft = await this.eventRepository.findOne({
            where: {
                name: createEventDto.name,
                user: { id: user.userId },
            },
        });
        if (existingDraft) {
            throw new common_1.BadRequestException('Event name existed');
        }
        else {
            await this.createEventDraft(user, createEventDto, files);
        }
    }
    async updateEventDraft(eventId, user, updateEventDto, files) {
        const userData = await this.userRepository.findOne({
            where: { id: user.userId },
        });
        if (!userData) {
            throw new common_1.BadRequestException('UserId is invalid');
        }
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.BadRequestException('Id is invalid');
        }
        if (eventId != event?.id && updateEventDto.name == event?.name) {
            throw new common_1.BadRequestException('Event name existed in other draft');
        }
        const unRemovedFileUrls = [
            updateEventDto.thumbnailFile ? undefined : event?.thumbnailUrl,
            updateEventDto.coverPhotoFile ? undefined : event?.coverPhotoUrl,
            updateEventDto.seatmapFile ? undefined : event?.seatmapUrl,
        ].filter((url) => url !== undefined);
        const thumbnailUrl = updateEventDto?.thumbnailUrl
            ? updateEventDto.thumbnailUrl
            : await this.filesService.uploadImage(files.thumbnailFile?.[0]);
        const coverPhotoUrl = updateEventDto?.coverPhotoUrl
            ? updateEventDto.coverPhotoUrl
            : await this.filesService.uploadImage(files.coverPhotoFile?.[0]);
        const seatmapUrl = updateEventDto?.seatmapUrl
            ? updateEventDto.seatmapUrl
            : await this.filesService.uploadImage(files.seatmapFile?.[0]);
        await this.deleteDraftEvent(eventId, user.userId, unRemovedFileUrls);
        const eventInput = this.eventRepository.create({
            id: eventId,
            thumbnailUrl: thumbnailUrl,
            coverPhotoUrl: coverPhotoUrl,
            seatmapUrl: seatmapUrl,
            status: event_entity_1.EventStatus.DRAFT,
            name: updateEventDto.name,
            venue: updateEventDto.venue,
            sellStartDate: updateEventDto.sellStartDate,
            sellEndDate: updateEventDto.sellEndDate,
            eventStartDate: updateEventDto.eventStartDate,
            eventEndDate: updateEventDto.eventEndDate,
            description: updateEventDto.description,
            location: updateEventDto.location,
            user: userData,
            maxPerUser: updateEventDto.maxPerUser,
        });
        return this.createEventDraftRecord(eventInput, updateEventDto);
    }
    async parseArrayTicketTierAndArtistClass(body) {
        let ticketTiers;
        let artistClasses;
        try {
            ticketTiers = JSON.parse(body.ticketTiers);
            artistClasses = JSON.parse(body.artistClasses);
        }
        catch (e) {
            throw new common_1.BadRequestException('Invalid JSON format for ticketTiers or artistClasses');
        }
        const ticketTiersPipe = new common_1.ParseArrayPipe({ items: dto_1.TicketTierDto });
        const artistClassesPipe = new common_1.ParseArrayPipe({ items: dto_1.ArtistClassDto });
        const validatedTicketTiers = await ticketTiersPipe.transform(ticketTiers, {
            type: 'body',
            metatype: dto_1.TicketTierDto,
        });
        const validatedArtistClasses = await artistClassesPipe.transform(artistClasses, {
            type: 'body',
            metatype: dto_1.ArtistClassDto,
        });
        const payload = {
            name: body.name,
            venue: body.venue,
            sellStartDate: body.sellStartDate,
            sellEndDate: body.sellEndDate,
            eventStartDate: body.eventStartDate,
            eventEndDate: body.eventEndDate,
            description: body.description,
            location: body.location,
            thumbnailUrl: body.thumbnailUrl,
            coverPhotoUrl: body.coverPhotoUrl,
            seatmapUrl: body.seatmapUrl,
            maxPerUser: parseInt(body.maxPerUser, 10),
            ticketTiers: validatedTicketTiers,
            artistClasses: validatedArtistClasses,
        };
        return payload;
    }
    async verifyEventDraft(payload) {
        if (!payload) {
            throw new common_1.BadRequestException('Payload is required');
        }
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(payload);
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid JSON format in metadata');
        }
        const dto = (0, class_transformer_1.plainToInstance)(dto_1.CreateEventDraftDto, parsedPayload);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const getAllErrorMessages = (errs) => {
                return errs.flatMap((err) => {
                    const constraints = err.constraints
                        ? Object.values(err.constraints)
                        : [];
                    const childErrors = err.children?.length
                        ? getAllErrorMessages(err.children)
                        : [];
                    return [...constraints, ...childErrors];
                });
            };
            const errorMessages = getAllErrorMessages(errors);
            if (errorMessages.length === 0) {
                throw new common_1.BadRequestException('Unknown validation errors');
            }
            throw new common_1.BadRequestException(errorMessages);
        }
        return parsedPayload;
    }
    async getUpcompingEvent() {
        const now = new Date().toISOString();
        return await this.eventRepository
            .createQueryBuilder('event')
            .where('event.event_start_date > :now', { now })
            .orderBy('event.event_start_date', 'ASC')
            .take(6)
            .getMany();
    }
    async verifyEventInformation(user, payload, files) {
        console.log('payload', payload);
        let eventData, savedEvent, ticketTiers = [];
        if (!payload.id) {
            eventData = await this.createEventDraft(user, payload, files);
        }
        else {
            eventData = await this.updateEventDraft(payload.id, user, payload, files);
        }
        savedEvent = eventData.savedEvent;
        for (let i = 0; i < eventData.ticketTiers.length; i++) {
            const updatedTier = await this.ticketTiersService.updateTierIndex(eventData.ticketTiers[i].id, i + 1);
            if (updatedTier) {
                ticketTiers.push(updatedTier);
            }
        }
        const eventMetadata = {
            offChainId: savedEvent.id,
            organizerId: user.userId,
            name: savedEvent.name,
            venue: savedEvent.venue,
            location: savedEvent.location,
            description: savedEvent.description,
            sellStartDate: savedEvent.sellStartDate,
            sellEndDate: savedEvent.sellEndDate,
            eventStartDate: savedEvent.eventStartDate,
            eventEndDate: savedEvent.eventEndDate,
            thumbnailUrl: savedEvent.thumbnailUrl,
            coverPhotoUrl: savedEvent.coverPhotoUrl,
            seatmapUrl: savedEvent.seatmapUrl,
        };
        const ticketMetadata = ticketTiers.map((ticketTier) => ({
            id: ticketTier.id,
            tierIndex: ticketTier.tierIndex,
            name: ticketTier.name,
            price: ticketTier.price,
            quantity: ticketTier.totalSupply,
            description: ticketTier.description,
            maxResalePrice: ticketTier.maxResalePrice,
            minResalePrice: ticketTier.minResalePrice,
            royaltyPercentage: ticketTier.royaltyPercentage,
        }));
        const [eventMetadataUrl, ticketMetadataUrl] = await Promise.all([
            this.ipfsService.uploadMetadata(eventMetadata),
            this.ipfsService.uploadMetadata(ticketMetadata),
        ]);
        await this.eventRepository.update(savedEvent.id, {
            eventMetadataUrl,
            ticketMetadataUrl,
        });
        const artistMetadata = [];
        payload.artistClasses.forEach((artistClass) => {
            artistClass.artists.forEach((artist) => {
                artistMetadata.push([
                    artist.walletAddress,
                    Number(artistClass.royaltyPercent * 100),
                ]);
            });
        });
        const tierMetadata = [];
        ticketTiers.forEach((ticketTier) => {
            tierMetadata.push([
                ticketTier.tierIndex,
                Number(ticketTier.price),
                ticketTier.totalSupply,
                ticketTier.totalSupply,
                ticketTier.royaltyPercentage,
                ticketTier.minResalePrice === null ? 0 : ticketTier.minResalePrice,
                ticketTier.maxResalePrice === null ? 0 : ticketTier.maxResalePrice,
            ]);
        });
        return {
            _eventMetadataURL: eventMetadataUrl,
            _artists: artistMetadata,
            _tiers: tierMetadata,
            _saleRule: {
                maxTicketsPerUser: savedEvent.maxPerUser,
                openSaleTime: new Date(savedEvent.sellStartDate).getTime() / 1000,
                endSaleTime: new Date(savedEvent.sellEndDate).getTime() / 1000,
            },
            _ticketMetadataURL: ticketMetadataUrl,
        };
    }
    async deleteDraftEvent(eventId, userId, unRemovedFileUrls = []) {
        const event = await this.eventRepository.findOne({
            where: { id: eventId, user: { id: userId }, status: event_entity_1.EventStatus.DRAFT },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        await this.ticketTiersService.deleteTicketTiers(eventId);
        const artistClassIds = await this.artistClassesService.getArtistClasses(eventId);
        await this.artistsService.deleteArtists(artistClassIds);
        await this.artistClassesService.deleteArtistClasses(eventId);
        await this.deleteEvent(eventId, unRemovedFileUrls);
    }
    async getEventDetails(eventId) {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: {
                user: true,
                ticketTiers: true,
                artistClasses: {
                    artists: true,
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.status === event_entity_1.EventStatus.PUBLISHED) {
            for (const ticketTier of event.ticketTiers) {
                const quantity = await this.scService.getRemainingTickets(event.onChainId, ticketTier.tierIndex);
                ticketTier.availableSupply = quantity;
                ticketTier.price = Number(ticketTier.price);
            }
        }
        else {
            for (const ticketTier of event.ticketTiers) {
                ticketTier.price = Number(ticketTier.price);
            }
        }
        const locationObject = event.location.split(' ');
        const latitude = +locationObject[locationObject.length - 2];
        const longitude = +locationObject[locationObject.length - 1];
        const locationName = locationObject.slice(0, -2).join(' ');
        const { location, user, ...eventData } = event;
        return {
            ...eventData,
            organizer: event.user,
            location: {
                latitude: +latitude,
                longitude: +longitude,
                locationName,
            },
        };
    }
    async searchEventsForOrganizer(tokenPayload, value, page = 1, limit = 10) {
        return value
            ? this.searchEventsForOrganizerWithValue(tokenPayload, value, page, limit)
            : this.searchEventsForOrganizerWithoutValue(tokenPayload, page, limit);
    }
    async searchEventsForOrganizerWithValue({ userId }, value, page, limit) {
        const searchQuery = value
            .split(' ')
            .map((word) => `${word}:*`)
            .join(' & ');
        const skip = (page - 1) * limit;
        const query = this.eventRepository
            .createQueryBuilder('event')
            .where("event.search_vector @@ to_tsquery('simple', :searchQuery)", {
            searchQuery,
        })
            .andWhere('event.organizer_id = :userId', { userId })
            .orderBy({
            "ts_rank(event.search_vector, to_tsquery('simple', :searchQuery))": 'DESC',
            'event.event_start_date': 'DESC',
        })
            .skip(skip)
            .take(limit);
        const [events, total] = await Promise.all([
            query.getMany(),
            query.getCount(),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            events,
            totalPages,
        };
    }
    async searchEventsForOrganizerWithoutValue({ userId }, page, limit) {
        const skip = (page - 1) * limit;
        const query = this.eventRepository
            .createQueryBuilder('event')
            .where('event.organizer_id = :userId', { userId })
            .orderBy({
            'event.event_start_date': 'DESC',
        })
            .skip(skip)
            .take(limit);
        const [events, total] = await Promise.all([
            query.getMany(),
            query.getCount(),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            events,
            totalPages,
        };
    }
    async deleteEvent(eventId, unRemovedFileUrls = []) {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        const fileUrls = [
            event.thumbnailUrl,
            event.coverPhotoUrl,
            event.seatmapUrl,
        ].filter((url) => url && !unRemovedFileUrls.includes(url));
        await this.eventRepository.delete(eventId);
        if (fileUrls.length > 0) {
            setImmediate(async () => {
                try {
                    await Promise.all(fileUrls.map(async (url) => {
                        await this.filesService.deleteImage(url);
                    }));
                    console.log(`Đã xóa các file trên Cloudinary cho sự kiện ${eventId}`);
                }
                catch (error) {
                    console.error(`Lỗi khi xóa file trên Cloudinary cho sự kiện ${eventId}:`, error);
                }
            });
        }
        return { message: `Sự kiện ${eventId} đã được xóa thành công` };
    }
    async checkEventCreationStatus({ userId }, { eventMetadataUrl, transactionHash }) {
        let eventMetadata;
        try {
            eventMetadata = await this.ipfsService.getMetadata(eventMetadataUrl);
        }
        catch (error) {
            throw new common_1.BadRequestException('Event metadata not found');
        }
        if (eventMetadata.organizerId !== userId) {
            throw new common_1.BadRequestException('Event metadata not match');
        }
        const savedEvent = await this.eventRepository.findOne({
            where: { id: eventMetadata.offChainId },
        });
        console.log({ eventMetadata, savedEvent });
        if (savedEvent?.status === event_entity_1.EventStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Event created before');
        }
        else if (savedEvent?.status === event_entity_1.EventStatus.PENDING) {
            return event_entity_1.EventStatus.PENDING;
        }
        else if (savedEvent?.status === event_entity_1.EventStatus.CANCELLED) {
            throw new common_1.BadRequestException('Event cancelled before');
        }
        const transaction = await this.blockchainSnapshotsService.getTransactionByHash(transactionHash);
        if (!transaction) {
            await this.eventRepository.update(eventMetadata.offChainId, {
                transactionHash: transactionHash,
                status: event_entity_1.EventStatus.PENDING,
            });
            return event_entity_1.EventStatus.PENDING;
        }
        await this.eventRepository.update(eventMetadata.offChainId, {
            status: event_entity_1.EventStatus.PUBLISHED,
            transactionHash: transactionHash,
            onChainId: transaction.eventData.eventId,
        });
        return event_entity_1.EventStatus.PUBLISHED;
    }
    async getEventsForMarketplace({ value, page = 1, limit = 8, startDate, endDate, minPrice, maxPrice, }) {
        const formattedStartDate = startDate
            ? new Date(startDate).toISOString()
            : undefined;
        const formattedEndDate = endDate
            ? new Date(endDate).toISOString()
            : undefined;
        return value
            ? this.getEventsForMarketplaceWithValue(value, page, limit, formattedStartDate, formattedEndDate, minPrice, maxPrice)
            : this.getEventsForMarketplaceWithoutValue(page, limit, formattedStartDate, formattedEndDate, minPrice, maxPrice);
    }
    async getEventsForMarketplaceWithoutValue(page, limit, startDate, endDate, minPrice, maxPrice) {
        const currentDate = new Date();
        const skip = (page - 1) * limit;
        const query = this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.user', 'user')
            .innerJoin('event.ticketTiers', 'ticketTiers')
            .innerJoin('ticketTiers.ticketSaleTransactions', 'ticketSaleTransactions')
            .select([
            'event.id AS "id"',
            'event.name AS "name"',
            'event.event_start_date AS "eventStartDate"',
            'event.event_end_date AS "eventEndDate"',
            'event.thumbnail_url AS "eventThumbnailUrl"',
            'event.location AS "location"',
            'event.venue AS "venue"',
            'MIN(ticketTiers.price) AS "minPrice"',
            'MAX(ticketTiers.price) AS "maxPrice"',
            'user.name AS "organizerName"',
            'user.thumbnail_url AS "organizerThumbnailUrl"',
        ])
            .andWhere('event.sell_end_date >= :currentDate', { currentDate })
            .andWhere('ticketSaleTransactions.status = :sellingStatus', {
            sellingStatus: ticket_sale_transaction_entity_1.TicketSaleStatus.SELLING,
        })
            .andWhere('ticketSaleTransactions.sale_id IS NOT NULL');
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.andWhere('ticketSaleTransactions.price_per_ticket BETWEEN :minPrice AND :maxPrice', {
                minPrice,
                maxPrice,
            });
        }
        else if (minPrice !== undefined) {
            query.andWhere('ticketSaleTransactions.price_per_ticket >= :minPrice', {
                minPrice,
            });
        }
        else if (maxPrice !== undefined) {
            query.andWhere('ticketSaleTransactions.price_per_ticket <= :maxPrice', {
                maxPrice,
            });
        }
        if (startDate !== undefined && endDate !== undefined) {
            query.andWhere('event.event_start_date >= :startDate AND event.event_end_date <= :endDate', { startDate, endDate });
        }
        else if (startDate !== undefined) {
            query.andWhere('event.event_start_date = :startDate', { startDate });
        }
        else if (endDate !== undefined) {
            query.andWhere('event.event_end_date = :endDate', { endDate });
        }
        query
            .orderBy(`ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`, 'ASC')
            .addOrderBy(`ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`, 'ASC')
            .groupBy('event.id')
            .addGroupBy('event.name')
            .addGroupBy('event.event_start_date')
            .addGroupBy('event.event_end_date')
            .addGroupBy('event.thumbnail_url')
            .addGroupBy('event.location')
            .addGroupBy('user.name')
            .addGroupBy('user.thumbnail_url')
            .setParameter('currentDate', currentDate)
            .offset(skip)
            .limit(limit);
        const [events, total] = await Promise.all([
            query.getRawMany(),
            query.getCount(),
        ]);
        const formatedEvents = events.map((event) => {
            const locationObject = event.location.split(' ');
            const latitude = +locationObject[locationObject.length - 2];
            const longitude = +locationObject[locationObject.length - 1];
            const locationName = locationObject.slice(0, -2).join(' ');
            event.location = {
                latitude,
                longitude,
                locationName,
            };
            return event;
        });
        return { events: formatedEvents, totalPages: Math.ceil(total / limit) };
    }
    async getEventsForMarketplaceWithValue(value, page, limit, startDate, endDate, minPrice, maxPrice) {
        const skip = (page - 1) * limit;
        const searchQuery = value
            .split(' ')
            .map((word) => `${word}:*`)
            .join(' & ');
        const currentDate = new Date();
        const query = this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.user', 'user')
            .innerJoin('event.ticketTiers', 'ticketTiers')
            .innerJoin('ticketTiers.ticketSaleTransactions', 'ticketSaleTransactions')
            .select([
            'event.id AS id',
            'event.name AS name',
            'event.event_start_date AS event_start_date',
            'event.event_end_date AS event_end_date',
            'event.thumbnail_url AS thumbnail_url',
            'event.location AS location',
            'event.venue AS venue',
            'MIN(ticketSaleTransactions.price_per_ticket) AS min_price',
            'MAX(ticketSaleTransactions.price_per_ticket) AS max_price',
            'user.name AS user_name',
            'user.thumbnail_url AS user_thumbnail_url',
        ])
            .where("event.search_vector @@ to_tsquery('simple', :searchQuery) OR " +
            "to_tsvector('simple', user.name) @@ to_tsquery('simple', :searchQuery)", { searchQuery })
            .andWhere('event.sell_end_date >= :currentDate', { currentDate })
            .andWhere('ticketSaleTransactions.status = :sellingStatus', {
            sellingStatus: ticket_sale_transaction_entity_1.TicketSaleStatus.SELLING,
        });
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.andWhere('ticketSaleTransactions.price_per_ticket BETWEEN :minPrice AND :maxPrice', {
                minPrice,
                maxPrice,
            });
        }
        else if (minPrice !== undefined) {
            query.andWhere('ticketSaleTransactions.price_per_ticket >= :minPrice', {
                minPrice,
            });
        }
        else if (maxPrice !== undefined) {
            query.andWhere('ticketSaleTransactions.price_per_ticket <= :maxPrice', {
                maxPrice,
            });
            if (startDate !== undefined && endDate !== undefined) {
                query.andWhere('event.event_start_date >= :startDate AND event.event_end_date <= :endDate', { startDate, endDate });
            }
            else if (startDate !== undefined) {
                query.andWhere('event.event_start_date = :startDate', { startDate });
            }
            else if (endDate !== undefined) {
                query.andWhere('event.event_end_date = :endDate', { endDate });
            }
            query
                .orderBy("ts_rank(event.search_vector, to_tsquery('english', :searchQuery)) + " +
                "ts_rank(to_tsvector('english', user.name), to_tsquery('english', :searchQuery))", 'DESC')
                .addOrderBy(`ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`, 'ASC')
                .addOrderBy(`ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`, 'ASC')
                .groupBy('event.id')
                .addGroupBy('event.name')
                .addGroupBy('event.event_start_date')
                .addGroupBy('event.event_end_date')
                .addGroupBy('event.thumbnail_url')
                .addGroupBy('event.location')
                .addGroupBy('user.name')
                .addGroupBy('user.thumbnail_url')
                .setParameter('currentDate', currentDate)
                .offset(skip)
                .limit(limit);
            const [events, total] = await Promise.all([
                query.getRawMany(),
                query.getCount(),
            ]);
            return {
                events,
                total,
            };
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        ticket_tiers_service_1.TicketTiersService,
        ipfs_service_1.IpfsService,
        files_service_1.FilesService,
        artist_classes_service_1.ArtistClassesService,
        artists_service_1.ArtistsService,
        nft_tickets_service_1.NftTicketsService,
        blockchain_snapshots_service_1.BlockchainSnapshotsService,
        sc_service_1.SCService])
], EventsService);
//# sourceMappingURL=events.service.js.map