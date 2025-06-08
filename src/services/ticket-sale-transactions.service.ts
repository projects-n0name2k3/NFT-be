import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDto } from '../dto';
import { GetTicketsByUserDto, SortType } from '../dto/get-ticket-inventory.dto';
import { TicketSaleTransaction } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class TicketSaleTransactionsService {
  constructor(
    @InjectRepository(TicketSaleTransaction)
    private readonly ticketSaleTransactionRepository: Repository<TicketSaleTransaction>,
  ) {}

  async getSellingTicketByUserId(
    user: TokenPayloadDto,
    {
      limit = 8,
      page = 1,
      sortType = SortType.DESC,
      value,
    }: GetTicketsByUserDto,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.ticketSaleTransactionRepository
      .createQueryBuilder('ticket_sale_transaction')
      .select([
        'ticket_sale_transaction.id as id',
        'ticket_sale_transaction.sale_id as sale_id',
        'ticket_sale_transaction.status as status',
        'ticket_sale_transaction.createdAt as "createdAt"',
        'ticketTier.name as "tierName"',
        'ticketTier.price as "price"',
        'ticket_sale_transaction.remainingQuantity as quantity',
        'event.id as "eventId"',
        'event.name as "eventName"',
        'event.location as "location"',
        'event.event_start_date as "eventStartDate"',
        'event.event_end_date as "eventEndDate"',
        'event.venue as "venue"',
        'event.thumbnail_url as "eventThumbnailUrl"',
        'event.createdAt as "eventCreatedAt"',
      ])
      .leftJoin('ticket_sale_transaction.ticketTier', 'ticketTier')
      .leftJoin('ticketTier.event', 'event')
      .where('ticket_sale_transaction.seller_wallet_address = :walletId', {
        walletId: user.walletAddress,
      })
      .andWhere('ticket_sale_transaction.remainingQuantity > 0')
      .andWhere('ticket_sale_transaction.status != :status', {
        status: 'closed',
      });

    if (value) {
      queryBuilder.andWhere('LOWER(event.name) LIKE LOWER(:eventName)', {
        eventName: `%${value}%`,
      });
    }

    queryBuilder
      .orderBy(
        'ticket_sale_transaction.createdAt',
        sortType === SortType.ASC ? 'ASC' : 'DESC',
      )
      .offset(skip)
      .limit(limit);

    const [ticketData, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);

    const tickets = ticketData.map(({ location, price, ...rest }) => ({
      ...rest,
      locationName: location?.split(' ').slice(0, -2).join(' ') || null,
      price: Number(price),
    }));

    const totalPages = Math.ceil(total / limit);
    return {
      tickets,
      totalPages,
    };
  }
}
