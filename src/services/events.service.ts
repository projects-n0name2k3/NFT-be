import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ParseArrayPipe,
  ValidationError,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ArtistClassDto,
  CheckEventCreationStatusDto,
  CreateEventDraftDto,
  GetEventMarketplaceDto,
  PublishEventDto,
  SearchEventDto,
  TicketTierDto,
  TokenPayloadDto,
} from '../dto';
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
import { TicketSaleStatus } from '../entities/ticket-sale-transaction.entity';
import { SCService } from '../services/sc.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly ticketTiersService: TicketTiersService,
    private readonly ipfsService: IpfsService,
    private readonly filesService: FilesService,
    private readonly artistClassesService: ArtistClassesService,
    private readonly artistsService: ArtistsService,
    private readonly nftTicketService: NftTicketsService,
    private readonly blockchainSnapshotsService: BlockchainSnapshotsService,
    private readonly scService: SCService,
  ) {}

  async searchEventsForUser({
    value,
    page = 1,
    limit = 8,
    minPrice,
    maxPrice,
    startDate,
    endDate,
  }: SearchEventDto) {
    const formattedStartDate = startDate
      ? new Date(startDate).toISOString()
      : undefined;
    const formattedEndDate = endDate
      ? new Date(endDate).toISOString()
      : undefined;
    return value
      ? this.searchEventsForUserWithValue(
          value,
          page,
          limit,
          minPrice,
          maxPrice,
          formattedStartDate,
          formattedEndDate,
        )
      : this.searchEventsForUserWithoutValue(
          page,
          limit,
          minPrice,
          maxPrice,
          formattedStartDate,
          formattedEndDate,
        );
  }

  async searchEventsForUserWithValue(
    value: string,
    page: number,
    limit: number,
    minPrice?: number,
    maxPrice?: number,
    startDate?: string,
    endDate?: string,
  ) {
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
        'event.id AS "id"', // Đảm bảo alias trong dấu nháy kép
        'event.name AS "name"',
        'event.event_start_date AS "eventStartDate"', // Sửa thành camelCase
        'event.event_end_date AS "eventEndDate"', // Sửa thành camelCase
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
      .andWhere(
        "event.search_vector @@ to_tsquery('simple', :searchQuery) OR " +
          "to_tsvector('simple', user.name) @@ to_tsquery('simple', :searchQuery)",
        { searchQuery },
      );

    // Filter minPrice và maxPrice
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere('ticketTiers.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      query.andWhere('ticketTiers.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      query.andWhere('ticketTiers.price <= :maxPrice', { maxPrice });
    }

    // Filter startDate và endDate
    if (startDate !== undefined && endDate !== undefined) {
      query.andWhere(
        'event.event_start_date >= :startDate AND event.event_end_date <= :endDate',
        { startDate, endDate },
      );
    } else if (startDate !== undefined) {
      query.andWhere('event.event_start_date = :startDate', { startDate });
    } else if (endDate !== undefined) {
      query.andWhere('event.event_end_date = :endDate', { endDate });
    }

    query
      .orderBy(
        "ts_rank(event.search_vector, to_tsquery('english', :searchQuery)) + " +
          "ts_rank(to_tsvector('english', user.name), to_tsquery('english', :searchQuery))",
        'DESC',
      )
      .addOrderBy(
        `ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`,
        'ASC',
      )
      .addOrderBy(
        `ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`,
        'ASC',
      )
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

  async searchEventsForUserWithoutValue(
    page: number,
    limit: number,
    minPrice?: number,
    maxPrice?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const currentDate = new Date();
    const skip = (page - 1) * limit;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoin('event.ticketTiers', 'ticketTiers')
      .select([
        'event.id AS "id"', // Dùng dấu nháy kép để giữ camelCase
        'event.name AS "name"',
        'event.event_start_date AS "eventStartDate"', // Sửa thành camelCase
        'event.event_end_date AS "eventEndDate"', // Sửa thành camelCase
        'event.thumbnail_url AS "eventThumbnailUrl"', // Sửa thành camelCase
        'event.location AS "location"',
        'event.venue AS "venue"', // Thêm venue nếu cần
        'MIN(ticketTiers.price) AS "minPrice"', // Sửa thành camelCase
        'MAX(ticketTiers.price) AS "maxPrice"', // Sửa thành camelCase
        'user.name AS "organizerName"', // Sửa thành camelCase
        'user.thumbnail_url AS "organizerThumbnailUrl"', // Sửa thành camelCase
      ])
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('event.event_end_date >= :currentDate', { currentDate });

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere('ticketTiers.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      query.andWhere('ticketTiers.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      query.andWhere('ticketTiers.price <= :maxPrice', { maxPrice });
    }

    if (startDate !== undefined && endDate !== undefined) {
      query.andWhere(
        'event.event_start_date >= :startDate AND event.event_end_date <= :endDate',
        { startDate, endDate },
      );
    } else if (startDate !== undefined) {
      query.andWhere('event.event_start_date = :startDate', { startDate });
    } else if (endDate !== undefined) {
      query.andWhere('event.event_end_date = :endDate', { endDate });
    }

    query
      .orderBy(
        `ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`,
        'ASC',
      )
      .addOrderBy(
        `ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`,
        'ASC',
      )
      .groupBy('event.id')
      .addGroupBy('event.name')
      .addGroupBy('event.event_start_date')
      .addGroupBy('event.event_end_date')
      .addGroupBy('event.thumbnail_url')
      .addGroupBy('event.location')
      .addGroupBy('event.venue') // Thêm venue vào groupBy để khớp với select
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

  async createEventDraft(
    user: TokenPayloadDto,
    createEventDto: CreateEventDraftDto,
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
  ) {
    const userData = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!userData) {
      throw new BadRequestException('UserId is invalid');
    }

    const uploadedFiles: {
      thumbnailFile?: string;
      coverPhotoFile?: string;
      seatmapFile?: string;
    } =
      files.thumbnailFile || files.coverPhotoFile || files.seatmapFile
        ? await this.uploadFileCreateEvent(files)
        : {};
    const eventInput = this.eventRepository.create({
      thumbnailUrl: uploadedFiles.thumbnailFile,
      coverPhotoUrl: uploadedFiles.coverPhotoFile,
      seatmapUrl: uploadedFiles.seatmapFile,
      status: EventStatus.DRAFT,
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

  async createEventDraftRecord(
    eventInput: Event,
    createEventDto: CreateEventDraftDto,
  ) {
    const savedEvent = await this.eventRepository.save(eventInput);
    const ticketTiers = await this.ticketTiersService.createTicketTiers(
      savedEvent.id,
      createEventDto.ticketTiers,
    );
    const artistClasses = await this.artistClassesService.createArtistClasses(
      savedEvent.id,
      createEventDto.artistClasses,
    );
    return { savedEvent, ticketTiers, artistClasses };
  }

  async uploadFileCreateEvent(files: {
    thumbnailFile?: Express.Multer.File;
    coverPhotoFile?: Express.Multer.File;
    seatmapFile?: Express.Multer.File;
  }) {
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

  async saveEventsDraft(
    user: TokenPayloadDto,
    createEventDto: CreateEventDraftDto,
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
  ) {
    const existingDraft = await this.eventRepository.findOne({
      where: {
        name: createEventDto.name,
        user: { id: user.userId },
      },
    });

    if (existingDraft) {
      throw new BadRequestException('Event name existed');
    } else {
      await this.createEventDraft(user, createEventDto, files);
    }
  }

  async updateEventDraft(
    eventId: string,
    user: TokenPayloadDto,
    updateEventDto,
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
  ) {
    const userData = await this.userRepository.findOne({
      where: { id: user.userId },
    });

    if (!userData) {
      throw new BadRequestException('UserId is invalid');
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new BadRequestException('Id is invalid');
    }
    if (eventId != event?.id && updateEventDto.name == event?.name) {
      throw new BadRequestException('Event name existed in other draft');
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
      status: EventStatus.DRAFT,
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

  async parseArrayTicketTierAndArtistClass(body: any) {
    let ticketTiers: any[];
    let artistClasses: any[];

    try {
      ticketTiers = JSON.parse(body.ticketTiers);
      artistClasses = JSON.parse(body.artistClasses);
    } catch (e) {
      throw new BadRequestException(
        'Invalid JSON format for ticketTiers or artistClasses',
      );
    }

    const ticketTiersPipe = new ParseArrayPipe({ items: TicketTierDto });
    const artistClassesPipe = new ParseArrayPipe({ items: ArtistClassDto });

    const validatedTicketTiers: TicketTierDto[] =
      await ticketTiersPipe.transform(ticketTiers, {
        type: 'body',
        metatype: TicketTierDto,
      });
    const validatedArtistClasses: ArtistClassDto[] =
      await artistClassesPipe.transform(artistClasses, {
        type: 'body',
        metatype: ArtistClassDto,
      });

    const payload: PublishEventDto = {
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

  async verifyEventDraft(payload: string) {
    if (!payload) {
      throw new BadRequestException('Payload is required');
    }
    let parsedPayload: CreateEventDraftDto;
    try {
      parsedPayload = JSON.parse(payload);
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in metadata');
    }

    const dto = plainToInstance(CreateEventDraftDto, parsedPayload);

    const errors = await validate(dto);
    if (errors.length > 0) {
      const getAllErrorMessages = (errs: ValidationError[]): string[] => {
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
        throw new BadRequestException('Unknown validation errors');
      }
      throw new BadRequestException(errorMessages);
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

  async verifyEventInformation(
    user: TokenPayloadDto,
    payload,
    files: {
      thumbnailFile?: Express.Multer.File;
      coverPhotoFile?: Express.Multer.File;
      seatmapFile?: Express.Multer.File;
    },
  ) {
    console.log('payload', payload);
    //update event draft
    let eventData,
      savedEvent,
      ticketTiers: TicketTier[] = [];

    if (!payload.id) {
      eventData = await this.createEventDraft(user, payload, files);
    } else {
      eventData = await this.updateEventDraft(payload.id, user, payload, files);
    }

    savedEvent = eventData.savedEvent;
    //update tier index
    for (let i = 0; i < eventData.ticketTiers.length; i++) {
      const updatedTier = await this.ticketTiersService.updateTierIndex(
        eventData.ticketTiers[i].id,
        i + 1,
      );
      if (updatedTier) {
        ticketTiers.push(updatedTier);
      }
    }

    //create event metdata
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

    //create ticket metadata
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

    //get event and ticket metadata url
    const [eventMetadataUrl, ticketMetadataUrl] = await Promise.all([
      this.ipfsService.uploadMetadata(eventMetadata),
      this.ipfsService.uploadMetadata(ticketMetadata),
    ]);

    //save metadata urls to event record
    await this.eventRepository.update(savedEvent.id, {
      eventMetadataUrl,
      ticketMetadataUrl,
    });

    //create artist metadata
    const artistMetadata: any[] = [];
    payload.artistClasses.forEach((artistClass) => {
      artistClass.artists.forEach((artist) => {
        artistMetadata.push([
          artist.walletAddress,
          Number(artistClass.royaltyPercent * 100),
        ]);
      });
    });

    //create tier metadata
    const tierMetadata: any[] = [];
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

    //return to fe
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

  async deleteDraftEvent(
    eventId: string,
    userId: string,
    unRemovedFileUrls: string[] = [],
  ) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, user: { id: userId }, status: EventStatus.DRAFT },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.ticketTiersService.deleteTicketTiers(eventId);
    const artistClassIds =
      await this.artistClassesService.getArtistClasses(eventId);
    await this.artistsService.deleteArtists(artistClassIds);
    await this.artistClassesService.deleteArtistClasses(eventId);
    await this.deleteEvent(eventId, unRemovedFileUrls);
  }

  async getEventDetails(eventId: string) {
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
      throw new NotFoundException('Event not found');
    }

    if (event.status === EventStatus.PUBLISHED) {
      for (const ticketTier of event.ticketTiers) {
        const quantity = await this.scService.getRemainingTickets(
          event.onChainId,
          ticketTier.tierIndex,
        );
        ticketTier.availableSupply = quantity;
        ticketTier.price = Number(ticketTier.price);
      }
    } else {
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

  async searchEventsForOrganizer(
    tokenPayload: TokenPayloadDto,
    value: string,
    page: number = 1,
    limit: number = 10,
  ) {
    return value
      ? this.searchEventsForOrganizerWithValue(tokenPayload, value, page, limit)
      : this.searchEventsForOrganizerWithoutValue(tokenPayload, page, limit);
  }

  async searchEventsForOrganizerWithValue(
    { userId }: TokenPayloadDto,
    value: string,
    page: number,
    limit: number,
  ) {
    const searchQuery = value
      .split(' ')
      .map((word) => `${word}:*`) // Thêm :* vào từng từ
      .join(' & '); // Nối các từ bằng & để yêu cầu tất cả từ đều xuất hiện
    const skip = (page - 1) * limit;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .where("event.search_vector @@ to_tsquery('simple', :searchQuery)", {
        searchQuery,
      })
      .andWhere('event.organizer_id = :userId', { userId })
      .orderBy({
        "ts_rank(event.search_vector, to_tsquery('simple', :searchQuery))":
          'DESC',
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

  async searchEventsForOrganizerWithoutValue(
    { userId }: TokenPayloadDto,
    page: number,
    limit: number,
  ) {
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

  async deleteEvent(eventId: string, unRemovedFileUrls: string[] = []) {
    // 1. Tìm sự kiện trong DB
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Lấy danh sách URL cần xóa
    const fileUrls = [
      event.thumbnailUrl,
      event.coverPhotoUrl,
      event.seatmapUrl,
    ].filter((url) => url && !unRemovedFileUrls.includes(url)); // Lọc các URL hợp lệ và không nằm trong unRemovedFileUrls

    // 3. Xóa trong database trước
    await this.eventRepository.delete(eventId);

    // 4. Dùng setImmediate để xóa file trên Cloudinary bất đồng bộ
    if (fileUrls.length > 0) {
      setImmediate(async () => {
        try {
          await Promise.all(
            fileUrls.map(async (url) => {
              await this.filesService.deleteImage(url);
            }),
          );
          console.log(`Đã xóa các file trên Cloudinary cho sự kiện ${eventId}`);
        } catch (error) {
          console.error(
            `Lỗi khi xóa file trên Cloudinary cho sự kiện ${eventId}:`,
            error,
          );
        }
      });
    }

    // 5. Trả kết quả ngay lập tức sau khi xóa trong DB
    return { message: `Sự kiện ${eventId} đã được xóa thành công` };
  }

  async checkEventCreationStatus(
    { userId }: TokenPayloadDto,
    { eventMetadataUrl, transactionHash }: CheckEventCreationStatusDto,
  ) {
    let eventMetadata;
    try {
      eventMetadata = await this.ipfsService.getMetadata(eventMetadataUrl);
    } catch (error) {
      throw new BadRequestException('Event metadata not found');
    }

    if (eventMetadata.organizerId !== userId) {
      throw new BadRequestException('Event metadata not match');
    }

    const savedEvent = await this.eventRepository.findOne({
      where: { id: eventMetadata.offChainId },
    });

    console.log({ eventMetadata, savedEvent });

    if (savedEvent?.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('Event created before');
    } else if (savedEvent?.status === EventStatus.PENDING) {
      return EventStatus.PENDING;
    } else if (savedEvent?.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Event cancelled before');
    }

    //get transaction in blockchain snapshots
    const transaction =
      await this.blockchainSnapshotsService.getTransactionByHash(
        transactionHash,
      );

    //if transaction is not found, update event with pending status
    if (!transaction) {
      await this.eventRepository.update(eventMetadata.offChainId, {
        transactionHash: transactionHash,
        status: EventStatus.PENDING,
      });
      return EventStatus.PENDING;
    }

    //if transaction existed, update event with status published and onChainId
    await this.eventRepository.update(eventMetadata.offChainId, {
      status: EventStatus.PUBLISHED,
      transactionHash: transactionHash,
      onChainId: (transaction.eventData as any).eventId,
    });
    return EventStatus.PUBLISHED;
  }

  async getEventsForMarketplace({
    value,
    page = 1,
    limit = 8,
    startDate,
    endDate,
    minPrice,
    maxPrice,
  }: GetEventMarketplaceDto) {
    const formattedStartDate = startDate
      ? new Date(startDate).toISOString()
      : undefined;
    const formattedEndDate = endDate
      ? new Date(endDate).toISOString()
      : undefined;

    return value
      ? this.getEventsForMarketplaceWithValue(
          value,
          page,
          limit,
          formattedStartDate,
          formattedEndDate,
          minPrice,
          maxPrice,
        )
      : this.getEventsForMarketplaceWithoutValue(
          page,
          limit,
          formattedStartDate,
          formattedEndDate,
          minPrice,
          maxPrice,
        );
  }

  async getEventsForMarketplaceWithoutValue(
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
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
        sellingStatus: TicketSaleStatus.SELLING,
      })
      .andWhere('ticketSaleTransactions.sale_id IS NOT NULL');
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere(
        'ticketSaleTransactions.price_per_ticket BETWEEN :minPrice AND :maxPrice',
        {
          minPrice,
          maxPrice,
        },
      );
    } else if (minPrice !== undefined) {
      query.andWhere('ticketSaleTransactions.price_per_ticket >= :minPrice', {
        minPrice,
      });
    } else if (maxPrice !== undefined) {
      query.andWhere('ticketSaleTransactions.price_per_ticket <= :maxPrice', {
        maxPrice,
      });
    }

    if (startDate !== undefined && endDate !== undefined) {
      query.andWhere(
        'event.event_start_date >= :startDate AND event.event_end_date <= :endDate',
        { startDate, endDate },
      );
    } else if (startDate !== undefined) {
      query.andWhere('event.event_start_date = :startDate', { startDate });
    } else if (endDate !== undefined) {
      query.andWhere('event.event_end_date = :endDate', { endDate });
    }

    query
      .orderBy(
        `ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`,
        'ASC',
      )
      .addOrderBy(
        `ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`,
        'ASC',
      )
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

  async getEventsForMarketplaceWithValue(
    value: string,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    const skip = (page - 1) * limit;
    // Thêm wildcard :* cho mỗi từ trong searchQuery để hỗ trợ prefix matching
    const searchQuery = value
      .split(' ')
      .map((word) => `${word}:*`) // Thêm :* vào từng từ
      .join(' & '); // Nối các từ bằng & để yêu cầu tất cả từ đều xuất hiện
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
      .where(
        "event.search_vector @@ to_tsquery('simple', :searchQuery) OR " +
          "to_tsvector('simple', user.name) @@ to_tsquery('simple', :searchQuery)",
        { searchQuery },
      )
      .andWhere('event.sell_end_date >= :currentDate', { currentDate })
      .andWhere('ticketSaleTransactions.status = :sellingStatus', {
        sellingStatus: TicketSaleStatus.SELLING,
      });

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere(
        'ticketSaleTransactions.price_per_ticket BETWEEN :minPrice AND :maxPrice',
        {
          minPrice,
          maxPrice,
        },
      );
    } else if (minPrice !== undefined) {
      query.andWhere('ticketSaleTransactions.price_per_ticket >= :minPrice', {
        minPrice,
      });
    } else if (maxPrice !== undefined) {
      query.andWhere('ticketSaleTransactions.price_per_ticket <= :maxPrice', {
        maxPrice,
      });

      if (startDate !== undefined && endDate !== undefined) {
        query.andWhere(
          'event.event_start_date >= :startDate AND event.event_end_date <= :endDate',
          { startDate, endDate },
        );
      } else if (startDate !== undefined) {
        query.andWhere('event.event_start_date = :startDate', { startDate });
      } else if (endDate !== undefined) {
        query.andWhere('event.event_end_date = :endDate', { endDate });
      }

      query
        .orderBy(
          "ts_rank(event.search_vector, to_tsquery('english', :searchQuery)) + " +
            "ts_rank(to_tsvector('english', user.name), to_tsquery('english', :searchQuery))",
          'DESC',
        )
        .addOrderBy(
          `ABS(EXTRACT(EPOCH FROM (event.event_start_date - :currentDate)))`,
          'ASC',
        )
        .addOrderBy(
          `ABS(EXTRACT(EPOCH FROM (event.sell_end_date - :currentDate)))`,
          'ASC',
        )
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
}
