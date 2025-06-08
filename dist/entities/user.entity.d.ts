import { BaseEntity } from '../entities/baseEntity';
import { Event } from '../entities/event.entity';
import { OrganizerDetail } from '../entities/organizer-detail.entity';
import { ActionLog } from '../entities/action-log.entity';
import { TicketSaleTransaction } from '../entities/ticket-sale-transaction.entity';
import { NftTicket } from '../entities/nft-ticket.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
export declare enum UserRole {
    USER = "user",
    ORGANIZER = "organizer"
}
export declare class User extends BaseEntity {
    walletAddress: string;
    name: string;
    thumbnailUrl: string;
    coverPhotoUrl: string;
    role: UserRole;
    events: Event[];
    organzierDetail: OrganizerDetail;
    actionLogs: ActionLog[];
    ticketSellTransactions: TicketSaleTransaction[];
    ticketBuyTransactions: TicketSaleTransaction[];
    nftTickets: NftTicket[];
    refreshTokens: RefreshToken[];
}
