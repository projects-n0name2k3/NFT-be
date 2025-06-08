import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, TicketSaleTransaction } from '../entities';
import { Between, LessThan, Repository } from 'typeorm';
import { parseISO, startOfDay, endOfDay, format } from 'date-fns';
import { GetStatisticsDto, TimePeriod } from '../dto/statictis.dto';
import { EventStatus } from '../entities/event.entity';
import { TokenPayloadDto } from '../dto';
import { SCService } from '../services/sc.service';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(TicketSaleTransaction)
    private readonly ticketSaleTransaction: Repository<TicketSaleTransaction>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly scService: SCService,
  ) {}

  private async getRevenueBreakdown(
    userId: string,
    type: TimePeriod,
    startDate: Date,
    endDate: Date,
  ): Promise<{ label: string; revenue: number }[]> {
    if (type === TimePeriod.MONTH) {
      // Group theo tuần
      const result = await this.ticketSaleTransaction
        .createQueryBuilder('t')
        .leftJoin('t.ticketTier', 'tt')
        .leftJoin('tt.event', 'e')
        .select(`EXTRACT(WEEK FROM t.createdAt)`, 'week')
        .addSelect(`SUM(t.pricePerTicket * t.initialQuantity)`, 'revenue')
        .where('e.user.id = :organizerId', { organizerId: userId })
        .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('week')
        .orderBy('week', 'ASC')
        .getRawMany();

      return result.map((r, index) => ({
        label: `Week ${index + 1}`,
        revenue: parseFloat(r.revenue),
      }));
    } else {
      // Group theo ngày
      const result = await this.ticketSaleTransaction
        .createQueryBuilder('t')
        .leftJoin('t.ticketTier', 'tt')
        .leftJoin('tt.event', 'e')
        .select(`DATE(t.createdAt)`, 'date')
        .addSelect(`SUM(t.pricePerTicket * t.initialQuantity)`, 'revenue')
        .where('e.user.id = :organizerId', { organizerId: userId })
        .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany();

      return result.map((r) => ({
        label: new Date(r.date).toLocaleDateString('en-US', {
          weekday: 'short', // Mon, Tue,...
          month: 'short',
          day: 'numeric',
        }),
        revenue: parseFloat(r.revenue),
      }));
    }
  }

  async getStatisticsData(
    user: TokenPayloadDto,
    { type, dateFrom, dateTo }: GetStatisticsDto,
  ) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case TimePeriod.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6); // Bao gồm cả hôm nay
        endDate = new Date(now);
        break;
      case TimePeriod.MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case TimePeriod.CUSTOM:
        startDate = dateFrom
          ? new Date(dateFrom)
          : new Date(now.setMonth(now.getMonth() - 1));
        endDate = dateTo ? new Date(dateTo) : new Date();
        break;
      default:
        throw new Error('Invalid time period');
    }

    // Đảm bảo endDate là cuối ngày
    endDate.setHours(23, 59, 59, 999);
    function getPreviousPeriod(
      type: TimePeriod,
      startDate: Date,
      endDate: Date,
    ): { startDate: Date; endDate: Date } {
      const prevStart = new Date(startDate);
      const prevEnd = new Date(endDate);

      switch (type) {
        case TimePeriod.WEEK:
          prevStart.setDate(startDate.getDate() - 7);
          prevEnd.setDate(endDate.getDate() - 7);
          break;
        case TimePeriod.MONTH:
          prevStart.setMonth(startDate.getMonth() - 1);
          prevEnd.setMonth(endDate.getMonth() - 1);
          break;
        case TimePeriod.CUSTOM:
          const diffInMs = endDate.getTime() - startDate.getTime();
          prevStart.setTime(startDate.getTime() - diffInMs);
          prevEnd.setTime(endDate.getTime() - diffInMs);
          break;
      }

      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setHours(23, 59, 59, 999);

      return { startDate: prevStart, endDate: prevEnd };
    }
    const previousPeriod = getPreviousPeriod(type, startDate, endDate);

    const previousRevenueRaw = await this.ticketSaleTransaction
      .createQueryBuilder('t')
      .leftJoin('t.ticketTier', 'tt')
      .leftJoin('tt.event', 'e')
      .where('e.user.id = :organizerId', { organizerId: user.userId })
      .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
        startDate: previousPeriod.startDate,
        endDate: previousPeriod.endDate,
      })
      .select(
        'COALESCE(SUM(t.pricePerTicket * t.initialQuantity), 0)',
        'previousRevenue',
      )
      .getRawOne();

    const previousTotalEvents = await this.eventRepository.count({
      where: {
        user: { id: user.userId },
        eventEndDate: LessThan(new Date()),
        eventStartDate: Between(
          previousPeriod.startDate,
          previousPeriod.endDate,
        ),
      },
    });
    const previousTotalOrders = await this.ticketSaleTransaction
      .createQueryBuilder('t')
      .leftJoin('t.ticketTier', 'tt')
      .leftJoin('tt.event', 'e')
      .where('e.user.id = :organizerId', { organizerId: user.userId })
      .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
        startDate: previousPeriod.startDate,
        endDate: previousPeriod.endDate,
      })
      .getCount();

    const previousRevenue = parseFloat(previousRevenueRaw.previousRevenue);

    const [
      numberOfEventsDraft,
      numberOfEventsPublished,
      numberOfEventsEnded,
      totalOrders,
      totalRevenueRaw,
      revenueBreakdown,
    ] = await Promise.all([
      this.eventRepository.count({
        where: {
          user: { id: user.userId },
          status: EventStatus.DRAFT,
          eventStartDate: Between(startDate, endDate),
        },
      }),
      this.eventRepository.count({
        where: {
          user: { id: user.userId },
          status: EventStatus.PUBLISHED,
          eventStartDate: Between(startDate, endDate),
        },
      }),
      this.eventRepository.count({
        where: {
          user: { id: user.userId },
          eventEndDate: LessThan(new Date()),
        },
      }),
      this.ticketSaleTransaction
        .createQueryBuilder('t')
        .leftJoin('t.ticketTier', 'tt')
        .leftJoin('tt.event', 'e')
        .where('e.user.id = :organizerId', { organizerId: user.userId })
        .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getCount(),
      this.ticketSaleTransaction
        .createQueryBuilder('t')
        .leftJoin('t.ticketTier', 'tt')
        .leftJoin('tt.event', 'e')
        .where('e.user.id = :organizerId', { organizerId: user.userId })
        .andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .select(
          'COALESCE(SUM(t.pricePerTicket * t.initialQuantity), 0)',
          'totalRevenue',
        )
        .getRawOne(),
      this.getRevenueBreakdown(user.userId, type, startDate, endDate),
    ]);

    const revenueChange = previousRevenue
      ? ((totalRevenueRaw.totalRevenue - previousRevenue) / previousRevenue) *
        100
      : 0;

    const revenueChangeFormatted = +revenueChange.toFixed(2);
    const eventChange = previousTotalEvents
      ? ((numberOfEventsDraft +
          numberOfEventsPublished +
          numberOfEventsEnded -
          previousTotalEvents) /
          previousTotalEvents) *
        100
      : 0;
    const eventChangeFormatted = +eventChange.toFixed(2);

    const orderChange = previousTotalOrders
      ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100
      : 0;
    const orderChangeFormatted = +orderChange.toFixed(2);

    return {
      numberOfEventsDraft,
      numberOfEventsPublished,
      numberOfEventsEnded,
      stat: [
        {
          title: 'Total Revenue',
          value: parseFloat(totalRevenueRaw.totalRevenue),
          change: revenueChangeFormatted,
        },
        {
          title: 'Total Orders',
          value: totalOrders,
          change: orderChangeFormatted,
        },
        {
          title: 'Total Events',
          value:
            numberOfEventsDraft + numberOfEventsPublished + numberOfEventsEnded,
          change: eventChangeFormatted,
        },
      ],
      revenueBreakdown,
    };
  }

  async getTicketsSoldStats(user: TokenPayloadDto, eventId?: string) {
    const eventQuery = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.ticketTiers', 'ticketTier')
      .where('event.user.id = :userId', { userId: user.userId })
      .andWhere('event.status = :status', { status: EventStatus.PUBLISHED });

    if (eventId && typeof eventId === 'string' && eventId !== '{}') {
      eventQuery.andWhere('event.id = :eventId', { eventId });
    }

    const events = await eventQuery.getMany();

    const result: any[] = [];

    for (const event of events) {
      let totalSupply = 0;
      let soldQuantity = 0;

      for (const ticketTier of event.ticketTiers) {
        totalSupply += ticketTier.totalSupply;

        // Lấy số lượng còn lại từ SC (on-chain)
        const remaining = await this.scService.getRemainingTickets(
          event.onChainId,
          ticketTier.tierIndex,
        );

        // Tính số vé đã bán
        const tierSold = ticketTier.totalSupply - remaining;

        soldQuantity += tierSold;
      }

      result.push({
        eventId: event.id,
        eventName: event.name,
        totalSupply,
        soldQuantity,
      });
    }

    return result;
  }
}
