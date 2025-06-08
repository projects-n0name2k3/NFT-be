import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortType } from '../dto/get-ticket-inventory.dto';
import { GetNftTicketDetailDto, TicketTierDto, TokenPayloadDto } from '../dto';
import { GetTicketsByUserDto } from '../dto/get-ticket-inventory.dto';
import { IsNull, Not, Repository } from 'typeorm';
import {
  Event,
  OrganizerDetail,
  TicketSaleTransaction,
  TicketTier,
  User,
  NftTicket,
  BlockchainSnapshot,
} from '../entities';
import { TicketDto } from '../dto/create-ticket.dto';
import { TicketSaleStatus } from '../entities/ticket-sale-transaction.entity';
import { from } from 'rxjs';
import { toASCII } from 'punycode';
import { SearchResaleTicketDto } from '../dto/search-resale-ticket.dto';
import { GetTicketsByTierDto } from '../dto/search-ticket.dto';
import { GetResaleTicketDto } from '../dto/get-resale-ticket.dto';

@Injectable()
export class NftTicketsService {
  constructor(
    @InjectRepository(NftTicket)
    private readonly nftTicketRepository: Repository<NftTicket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketSaleTransaction)
    private readonly ticketSaleTransactionRepository: Repository<TicketSaleTransaction>,
    @InjectRepository(OrganizerDetail)
    private readonly organizerDetailnRepository: Repository<OrganizerDetail>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(BlockchainSnapshot)
    private readonly blockchainSnapshotRepository: Repository<BlockchainSnapshot>,
  ) {}

  async getNftTicketsByUser(
    { userId }: TokenPayloadDto,
    {
      limit = 8,
      page = 1,
      sortType = SortType.DESC,
      value,
    }: GetTicketsByUserDto,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.nftTicketRepository
      .createQueryBuilder('nft_ticket')
      .select([
        'ticketTier.id as "tierId"',
        'ticketTier.name as "tierName"',
        'ticketTier.price as "price"',
        'SUM(nft_ticket.quantity) as quantity',
        'event.id as "eventId"',
        'event.name as "eventName"',
        'event.location as "location"',
        'event.event_start_date as "eventStartDate"',
        'event.event_end_date as "eventEndDate"',
        'event.venue as "venue"',
        'event.thumbnail_url as "eventThumbnailUrl"',
        'event.createdAt as "eventCreatedAt"',
        'MIN(nft_ticket.createdAt) as "firstPurchaseDate"',
        'MAX(nft_ticket.createdAt) as "lastPurchaseDate"',
        'nft_ticket.id as id',
      ])
      .leftJoin('nft_ticket.ticketTier', 'ticketTier')
      .leftJoin('ticketTier.event', 'event')
      .where('nft_ticket.owner_id = :userId', {
        userId: userId,
      })
      .andWhere('nft_ticket.quantity > 0');

    if (value) {
      queryBuilder.andWhere('LOWER(event.name) LIKE LOWER(:eventName)', {
        eventName: `%${value}%`,
      });
    }

    queryBuilder
      .groupBy('ticketTier.id')
      .addGroupBy('ticketTier.name')
      .addGroupBy('ticketTier.price')
      .addGroupBy('event.id')
      .addGroupBy('event.name')
      .addGroupBy('event.location')
      .addGroupBy('event.event_start_date')
      .addGroupBy('event.event_end_date')
      .addGroupBy('event.venue')
      .addGroupBy('event.thumbnail_url')
      .addGroupBy('event.createdAt')
      .addGroupBy('nft_ticket.id');

    queryBuilder
      .orderBy(
        'MAX(nft_ticket.createdAt)',
        sortType === SortType.ASC ? 'ASC' : 'DESC',
      )
      .offset(skip)
      .limit(limit);

    const countQuery = this.nftTicketRepository
      .createQueryBuilder('nft_ticket')
      .select('COUNT(DISTINCT ticketTier.id)', 'count')
      .leftJoin('nft_ticket.ticketTier', 'ticketTier')
      .leftJoin('ticketTier.event', 'event')
      .where('nft_ticket.owner_id = :userId', {
        userId: userId,
      })
      .andWhere('nft_ticket.quantity > 0');

    if (value) {
      countQuery.andWhere('LOWER(event.name) LIKE LOWER(:eventName)', {
        eventName: `%${value}%`,
      });
    }

    const [ticketData, totalResult] = await Promise.all([
      queryBuilder.getRawMany(),
      countQuery.getRawOne(),
    ]);

    const total = totalResult ? parseInt(totalResult.count, 10) : 0;

    const tickets = ticketData.map(
      ({ location, price, firstPurchaseDate, lastPurchaseDate, ...rest }) => ({
        ...rest,
        locationName: location?.split(' ').slice(0, -2).join(' ') || null,
        price: Number(price),
        firstPurchaseDate,
        lastPurchaseDate,
        purchaseInfo: `First bought: ${new Date(firstPurchaseDate).toLocaleDateString()}, Last bought: ${new Date(lastPurchaseDate).toLocaleDateString()}`,
      }),
    );

    const totalPages = Math.ceil(total / limit);
    return {
      tickets,
      totalPages,
    };
  }

  async getResaleTicket(
    eventId: string,
    { limit = 8, page = 1 }: GetResaleTicketDto,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: {
        user: true,
        artistClasses: {
          artists: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const skip = (page - 1) * limit;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('events')
      .innerJoin('users', 'users', 'users.id = events.organizer_id')
      .innerJoin(
        'ticket_tiers',
        'ticket_tiers',
        'events.id = ticket_tiers.event_id',
      )
      .innerJoin(
        'ticket_sale_transactions',
        'ticket_sale_transactions',
        'ticket_sale_transactions.tier_id = ticket_tiers.id',
      )
      .leftJoin(
        'users',
        'sellers',
        'sellers.wallet_address = ticket_sale_transactions.seller_wallet_address',
      )
      .where('events.id = :eventId', { eventId })
      .andWhere('ticket_sale_transactions.status = :status', {
        status: 'selling',
      })
      .andWhere('ticket_sale_transactions.sale_id IS NOT NULL')
      .select([
        'ticket_tiers.name AS "name"',
        'ticket_tiers.price AS "rawPrice"',
        'ticket_tiers.totalSupply AS "totalSupply"',
        'ticket_tiers.availableSupply AS "availableSupply"',
        'ticket_tiers.minResalePrice AS "minResalePrice"',
        'ticket_tiers.maxResalePrice AS "maxResalePrice"',
        'ticket_tiers.royaltyPercentage AS "royaltyPercentage"',
        'ticket_tiers.description AS "description"',
        'ticket_sale_transactions.pricePerTicket AS "resalePrice"',
        'ticket_sale_transactions.tier_id AS "id"',
        'ticket_sale_transactions.sellerWalletAddress AS "sellerAddress"',
        'sellers.name AS "sellerName"',
      ])
      .orderBy('events.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const tickets = await queryBuilder.getRawMany();
    console.log(tickets);
    const ticketsGroupedByName = tickets.reduce((acc, ticket) => {
      const name = ticket.name;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push({
        ...ticket,
        rawPrice: +ticket.rawPrice,
        resalePrice: +ticket.resalePrice,
      });
      return acc;
    }, {});

    const formattedTickets = Object.entries(ticketsGroupedByName).map(
      ([name, tickets]: [string, any[]]) => ({
        name,
        id: tickets[0].id, // Add id field from the first ticket in the group
        tickets,
      }),
    );

    const locationObject = event.location.split(' ');
    const latitude = +locationObject[locationObject.length - 2];
    const longitude = +locationObject[locationObject.length - 1];
    const locationName = locationObject.slice(0, -2).join(' ');
    const { location, user, ...eventData } = event;

    return {
      event: {
        ...eventData,
        organizer: event.user,
        location: {
          latitude: +latitude,
          longitude: +longitude,
          locationName,
        },
        ticketTiers: formattedTickets,
      },
    };
  }

  async checkTicketMintStatus(transaction_hash: string) {
    const blockchainSnapshot =
      await this.blockchainSnapshotRepository.findOneBy({
        transactionHash: transaction_hash,
      });
    if (blockchainSnapshot) {
      return blockchainSnapshot.status;
    } else {
      return TicketSaleStatus.PENDING;
    }
  }

  async getTicketsByTier(eventId: string, getTicketsDto: GetTicketsByTierDto) {
    const { skip, limit, sortType = SortType.DESC, tierId } = getTicketsDto;
    const queryBuilder = this.eventRepository
      .createQueryBuilder('events')
      .innerJoin('users', 'users', 'users.id = events.organizer_id')
      .innerJoin(
        'ticket_tiers',
        'ticket_tiers',
        'events.id = ticket_tiers.event_id',
      )
      .where('events.id = :eventId', { eventId })
      .andWhere('ticket_tiers.id = :tierId', { tierId })
      .select([
        'users.name AS "organizerName"',
        'events.name AS "eventName"',
        'events.location AS location',
        'events.event_start_date AS "eventStartDate"',
        'events.event_end_date AS "eventEndDate"',
        'ticket_tiers.name AS "ticketTierName"',
        'ticket_tiers.price AS price',
        'ticket_tiers.totalSupply AS "totalSupply"',
        'ticket_tiers.availableSupply AS "availableSupply"',
        'ticket_tiers.minResalePrice AS "minResalePrice"',
        'ticket_tiers.maxResalePrice AS "maxResalePrice"',
        'ticket_tiers.royaltyPercentage AS "royaltyPercentage"',
        'ticket_tiers.description AS "description"',
      ])
      .orderBy('events.createdAt', sortType === SortType.ASC ? 'ASC' : 'DESC')
      .skip(skip)
      .take(limit);

    const [tickets, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      tickets,
      totalPages,
    };
  }

  async getResaleTicketByPrice({
    page = 1,
    limit = 8,
    minPrice,
    maxPrice,
  }: SearchResaleTicketDto) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.eventRepository
      .createQueryBuilder('events')
      .innerJoin('users', 'users', 'users.id = events.organizer_id')
      .innerJoin(
        'ticket_tiers',
        'ticket_tiers',
        'events.id = ticket_tiers.event_id',
      )
      .innerJoin(
        'ticket_sale_transactions',
        'ticket_sale_transactions',
        'ticket_sale_transactions.tier_id = ticket_tiers.id',
      )
      .innerJoin(
        'nft_tickets',
        'nft_tickets',
        'nft_tickets.tier_id = ticket_tiers.id',
      )
      .where('ticket_sale_transactions.status = :status', { status: 'selling' })
      .select([
        'users.name AS "organizerName"',
        'events.name AS "eventName"',
        'events.location AS "location"',
        'events.event_start_date AS "eventStartDate"',
        'events.event_end_date AS "eventEndDate"',
        'ticket_tiers.price AS "price"',
        'ticket_tiers.name AS "ticketTierName"',
        'nft_tickets.quantity AS "quantity"',
      ]);

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere(
        'ticket_tiers.price BETWEEN :minPrice AND :maxPrice',
        {
          minPrice,
          maxPrice,
        },
      );
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('ticket_tiers.price >= :minPrice', {
        minPrice,
      });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('ticket_tiers.price <= :maxPrice', {
        maxPrice,
      });
    }

    queryBuilder.orderBy('events.createdAt', 'DESC').skip(skip).take(limit);

    const [result, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      result,
      totalPages,
    };
  }

  async getNftTicketDetails(
    { userId }: TokenPayloadDto,
    { nftTicketId }: GetNftTicketDetailDto,
  ) {
    const nftTicketDetail = await this.nftTicketRepository.findOne({
      where: {
        id: nftTicketId,
        owner: { id: userId },
      },
      relations: ['ticketTier', 'ticketTier.event.user'],
    });

    if (!nftTicketDetail) {
      throw new BadRequestException('NFT ticket not found');
    }

    const ticketTierData = nftTicketDetail.ticketTier;
    const eventData = nftTicketDetail.ticketTier.event;

    const locationObject = eventData.location.split(' ');
    const latitude = +locationObject[locationObject.length - 2];
    const longitude = +locationObject[locationObject.length - 1];
    const locationName = locationObject.slice(0, -2).join(' ');

    return {
      event: {
        id: eventData.id,
        name: eventData.name,
        description: eventData.description,
        eventStartDate: eventData.eventStartDate,
        eventEndDate: eventData.eventEndDate,
        sellStartDate: eventData.sellStartDate,
        sellEndDate: eventData.sellEndDate,
        thumbnailUrl: eventData.thumbnailUrl,
        coverPhotoUrl: eventData.coverPhotoUrl,
        venue: eventData.venue,
        seatmapUrl: eventData.seatmapUrl,
        maxPerUser: eventData.maxPerUser,
        onchainId: eventData.onChainId,
        ticketAddress: eventData.ticketAddress,
        transactionHash: eventData.transactionHash,
        location: {
          latitude: latitude,
          longitude: longitude,
          locationName: locationName,
        },
      },
      organizer: eventData.user,
      ticketTier: {
        id: ticketTierData.id,
        name: ticketTierData.name,
        price: +ticketTierData.price,
        totalSupply: ticketTierData.totalSupply,
        availableSupply: ticketTierData.availableSupply,
        minResalePrice: ticketTierData.minResalePrice,
        maxResalePrice: ticketTierData.maxResalePrice,
        royaltyPercentage: ticketTierData.royaltyPercentage,
        tierIndex: ticketTierData.tierIndex,
        description: ticketTierData.description,
        // Add other ticketTier properties you need
      },
      nftTicket: {
        id: nftTicketDetail.id,
        owner: nftTicketDetail.owner,
        quantity: nftTicketDetail.quantity,
        // Add other nftTicket properties you need
      },
    };
  }

  async getResaleTicketDetails(tierId: string) {
    if (!tierId) {
      throw new BadRequestException('Invalid ticket sale tier ID');
    }
    //get ticket sale transaction tier id = tierId then have seller wallet address then join to user table to get seller name and wallet address
    const ticketSaleTransaction = await this.ticketSaleTransactionRepository
      .createQueryBuilder('ticket_sale_transaction')
      .select([
        'ticket_sale_transaction.id as id',
        'ticket_sale_transaction.sale_id as sale_id',
        'ticket_sale_transaction.status as status',
        'ticketTier.name as "tierName"',
        'ticketTier.id as "tierId"',
        'ticketTier.min_resale_price as "minResalePrice"',
        'ticketTier.max_resale_price as "maxResalePrice"',
        'ticketTier.royalty_percentage as "royaltyPercentage"',
        'ticketTier.price as "rawPrice"',
        'ticket_sale_transaction.price_per_ticket as "price"',
        'ticket_sale_transaction.remainingQuantity as quantity',
        'sellers.name as "sellerName"',
        'sellers.wallet_address as "sellerWalletAddress"',
        'ticket_sale_transaction.createdAt as "createdAt"',
      ])
      .leftJoin('ticket_sale_transaction.ticketTier', 'ticketTier')
      .leftJoin(
        'users',
        'sellers',
        'sellers.wallet_address = ticket_sale_transaction.seller_wallet_address',
      )
      .where('ticket_sale_transaction.tier_id = :tierId', { tierId })
      .andWhere('ticket_sale_transaction.status = :status', {
        status: TicketSaleStatus.SELLING,
      })
      .andWhere('ticket_sale_transaction.remainingQuantity > 0')
      .andWhere('ticket_sale_transaction.sale_id IS NOT NULL')
      .getRawMany();
    if (!ticketSaleTransaction) {
      throw new NotFoundException('Ticket sale transaction not found');
    }

    return {
      ...ticketSaleTransaction,
    };
  }
}
