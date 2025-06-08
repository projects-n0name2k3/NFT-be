import { BaseEntity } from './baseEntity';
import { Event } from './event.entity';
import { NftTicket } from './nft-ticket.entity';
import { TicketSaleTransaction } from './ticket-sale-transaction.entity';
export declare class TicketTier extends BaseEntity {
    name: string;
    price: number;
    totalSupply: number;
    availableSupply: number;
    maxResalePrice: number;
    minResalePrice: number;
    royaltyPercentage: number;
    tierIndex: number;
    description: string;
    event: Event;
    nftTickets: NftTicket[];
    ticketSaleTransactions: TicketSaleTransaction[];
}
