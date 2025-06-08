import { TokenPayloadDto } from '../dto';
import { GetTicketsByUserDto } from '../dto/get-ticket-inventory.dto';
import { TicketSaleTransaction } from '../entities';
import { Repository } from 'typeorm';
export declare class TicketSaleTransactionsService {
    private readonly ticketSaleTransactionRepository;
    constructor(ticketSaleTransactionRepository: Repository<TicketSaleTransaction>);
    getSellingTicketByUserId(user: TokenPayloadDto, { limit, page, sortType, value, }: GetTicketsByUserDto): Promise<{
        tickets: any[];
        totalPages: number;
    }>;
}
