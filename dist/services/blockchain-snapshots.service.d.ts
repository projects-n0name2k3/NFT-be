import { TokenPayloadDto, VerifyBuyResaleTicketStatusDto, VerifyResaleCancellationStatusDto, VerifyResaleCreationStatusDto } from '../dto';
import { BlockchainSnapshot, TicketTier, TicketSaleTransaction } from '../entities';
import { Repository } from 'typeorm';
import { EventBlockchain } from './blockchain-event-processor.service';
export declare class BlockchainSnapshotsService {
    private readonly blockchainSnapshotRepository;
    private readonly ticketTierRepository;
    private readonly ticketSaleTransactionRepository;
    constructor(blockchainSnapshotRepository: Repository<BlockchainSnapshot>, ticketTierRepository: Repository<TicketTier>, ticketSaleTransactionRepository: Repository<TicketSaleTransaction>);
    getTransactionByHash(transactionHash: string): Promise<BlockchainSnapshot | null>;
    getLatestBlockFromDb(eventName: EventBlockchain): Promise<number>;
    verifyResaleCreationStatus({ eventId, ticketTier, pricePerTicket, amount, transactionHash, }: VerifyResaleCreationStatusDto, user: TokenPayloadDto): Promise<"pending" | "success" | "failed">;
    verifyResaleCancellationStatus({ saleId, transactionHash }: VerifyResaleCancellationStatusDto, user: TokenPayloadDto): Promise<"pending" | "success" | "failed">;
    verifyBuyResaleTicketStatus({ saleId, amount, transactionHash }: VerifyBuyResaleTicketStatusDto, user: TokenPayloadDto): Promise<"pending" | "success" | "failed">;
}
