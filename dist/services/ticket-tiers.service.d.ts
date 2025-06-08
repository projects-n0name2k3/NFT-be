import { TicketTierDto } from '../dto';
import { Event, TicketSaleTransaction, TicketTier } from '../entities';
import { SCService } from '../services/sc.service';
import { Repository } from 'typeorm';
export declare class TicketTiersService {
    private readonly scService;
    private readonly ticketTierRepository;
    private readonly eventRepository;
    private readonly ticketSaleTransactionRepository;
    constructor(scService: SCService, ticketTierRepository: Repository<TicketTier>, eventRepository: Repository<Event>, ticketSaleTransactionRepository: Repository<TicketSaleTransaction>);
    getTicketTierDetails(tierId: string): Promise<{
        availableSupply: number;
        name: string;
        price: number;
        totalSupply: number;
        maxResalePrice: number;
        minResalePrice: number;
        royaltyPercentage: number;
        tierIndex: number;
        description: string;
        event: Event;
        nftTickets: import("../entities").NftTicket[];
        ticketSaleTransactions: TicketSaleTransaction[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTicketTiers(eventId: string, ticketTierDto: TicketTierDto[]): Promise<TicketTier[]>;
    deleteTicketTiers(eventId: string): Promise<void>;
    updateTierIndex(tierId: string, tierIndex: number): Promise<TicketTier | null>;
}
