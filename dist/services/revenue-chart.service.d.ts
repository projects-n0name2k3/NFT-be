import { Event, TicketSaleTransaction } from '../entities';
import { Repository } from 'typeorm';
import { GetStatisticsDto } from '../dto/statictis.dto';
import { TokenPayloadDto } from '../dto';
import { SCService } from '../services/sc.service';
export declare class RevenueService {
    private readonly ticketSaleTransaction;
    private readonly eventRepository;
    private readonly scService;
    constructor(ticketSaleTransaction: Repository<TicketSaleTransaction>, eventRepository: Repository<Event>, scService: SCService);
    private getRevenueBreakdown;
    getStatisticsData(user: TokenPayloadDto, { type, dateFrom, dateTo }: GetStatisticsDto): Promise<{
        numberOfEventsDraft: number;
        numberOfEventsPublished: number;
        numberOfEventsEnded: number;
        stat: {
            title: string;
            value: number;
            change: number;
        }[];
        revenueBreakdown: {
            label: string;
            revenue: number;
        }[];
    }>;
    getTicketsSoldStats(user: TokenPayloadDto, eventId?: string): Promise<any[]>;
}
