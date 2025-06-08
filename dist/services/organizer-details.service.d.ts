import { Repository } from 'typeorm';
import { TokenPayloadDto, UpdateOrganizerDto } from '../dto';
import { UsersService } from './users.service';
import { OrganizerDetail } from '../entities';
export declare class OrganizerDetailsService {
    private readonly organizerDetailRepository;
    private readonly usersService;
    constructor(organizerDetailRepository: Repository<OrganizerDetail>, usersService: UsersService);
    updateOrganizerInformation(user: TokenPayloadDto, files: {
        coverImage?: Express.Multer.File[];
        thumbnailImage?: Express.Multer.File[];
    }, payload: UpdateOrganizerDto): Promise<{
        updatedUser: import("../entities").User;
        updatedOrganizerDetail: OrganizerDetail;
    }>;
    getOrganizerProfile(user: TokenPayloadDto): Promise<{
        walletAddress: string;
        name: string;
        thumbnailUrl: string;
        coverPhotoUrl: string;
        role: import("../entities/user.entity").UserRole;
        events: import("../entities").Event[];
        organzierDetail: OrganizerDetail;
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
        user: import("../entities").User;
    }>;
}
