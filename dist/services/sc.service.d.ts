import { ConfigService } from '@nestjs/config';
export declare class SCService {
    private readonly configService;
    private readonly provider;
    private readonly wallet;
    private readonly eventManagementContract;
    private readonly ticketManagementContract;
    constructor(configService: ConfigService);
    addOrganizerWalletAddressToWhitelist(walletAddress: string): Promise<void>;
    getRemainingTickets(eventId: number, tierId: number): Promise<number>;
}
