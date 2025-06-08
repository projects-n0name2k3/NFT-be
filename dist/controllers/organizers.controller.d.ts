import { HttpStatus } from '@nestjs/common';
import { OrganizerDetailsService } from '../services';
import { UpdateOrganizerDto, TokenPayloadDto } from '../dto';
import { UserRole } from '../entities/user.entity';
export declare class OrganizersController {
    private readonly organizerDetailsService;
    constructor(organizerDetailsService: OrganizerDetailsService);
    updateOrganizerInformation(user: TokenPayloadDto, files: {
        coverPhotoImage?: Express.Multer.File[];
        thumbnailImage?: Express.Multer.File[];
    }, payload: UpdateOrganizerDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            user: {
                email: string;
                phoneNumber: string;
                bio: string;
                facebookLink: string;
                telegramLink: string;
                instagramLink: string;
                xLink: string;
                discordLink: string;
                websiteLink: string;
                user: import("../entities/user.entity").User;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                walletAddress: string;
                name: string;
                thumbnailUrl: string;
                coverPhotoUrl: string;
                role: UserRole;
                events: import("../entities").Event[];
                organzierDetail: import("../entities").OrganizerDetail;
                actionLogs: import("../entities").ActionLog[];
                ticketSellTransactions: import("../entities").TicketSaleTransaction[];
                ticketBuyTransactions: import("../entities").TicketSaleTransaction[];
                nftTickets: import("../entities").NftTicket[];
                refreshTokens: import("../entities").RefreshToken[];
            };
        };
    }>;
    getOrganizerProfile(user: TokenPayloadDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            user: {
                walletAddress: string;
                name: string;
                thumbnailUrl: string;
                coverPhotoUrl: string;
                role: UserRole;
                events: import("../entities").Event[];
                organzierDetail: import("../entities").OrganizerDetail;
                actionLogs: import("../entities").ActionLog[];
                ticketSellTransactions: import("../entities").TicketSaleTransaction[];
                ticketBuyTransactions: import("../entities").TicketSaleTransaction[];
                nftTickets: import("../entities").NftTicket[];
                refreshTokens: import("../entities").RefreshToken[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phoneNumber: string;
                bio: string;
                facebookLink: string;
                telegramLink: string;
                instagramLink: string;
                xLink: string;
                discordLink: string;
                websiteLink: string;
                user: import("../entities/user.entity").User;
            };
        };
    }>;
}
