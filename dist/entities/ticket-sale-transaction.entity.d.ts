import { BaseEntity } from './baseEntity';
import { TicketTier } from './ticket-tier.entity';
export declare enum TicketSaleStatus {
    DRAFT = "draft",
    SELLING = "selling",
    SOLD = "sold",
    CLOSED = "closed",
    PENDING = "pending"
}
export declare class TicketSaleTransaction extends BaseEntity {
    saleId: number;
    sellerWalletAddress: string;
    buyerWalletAddress: string;
    transactionHash: string;
    pricePerTicket: number;
    initialQuantity: number;
    remainingQuantity: number;
    status: TicketSaleStatus;
    ticketTier: TicketTier;
}
