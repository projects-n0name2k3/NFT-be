import { BaseEntity } from './baseEntity';
import { TicketTier } from './ticket-tier.entity';
import { User } from './user.entity';
export declare class NftTicket extends BaseEntity {
    owner: User;
    quantity: number;
    ticketTier: TicketTier;
}
