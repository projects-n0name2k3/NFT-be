import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { BlockchainSnapshotsService } from '../services/blockchain-snapshots.service';
import { Event } from '../entities/event.entity';
import { Repository } from 'typeorm';
import { BlockchainSnapshot, BlockchainSnapshotStatus } from '../entities/blockchain-snapshot.entity';
import { NftTicket, TicketSaleTransaction, TicketTier, User } from '../entities';
export declare enum EventBlockchain {
    CREATE_EVENT = "CreatedEvent",
    TICKET_SOLD = "TicketSold",
    RESOLE_TICKET = "ResoldTicket",
    CANCELLED_RESELL_TICKET = "CancelledResellTicket",
    BOUGHT_TICKET = "BoughtTicket"
}
export declare class BlockchainEventProcessor {
    private readonly configService;
    private readonly blockchainSnapshotsService;
    private readonly blockchainSnapshotRepository;
    private readonly eventRepository;
    private readonly ticketSaleTransactionRepository;
    private readonly userRepository;
    private readonly ticketTierRepository;
    private readonly nftTicketRepository;
    private readonly cacheManager;
    private readonly logger;
    private readonly ifaceEvent;
    private readonly ifaceTicketSold;
    private readonly ifaceMarketplace;
    private readonly BATCH_SIZE;
    constructor(configService: ConfigService, blockchainSnapshotsService: BlockchainSnapshotsService, blockchainSnapshotRepository: Repository<BlockchainSnapshot>, eventRepository: Repository<Event>, ticketSaleTransactionRepository: Repository<TicketSaleTransaction>, userRepository: Repository<User>, ticketTierRepository: Repository<TicketTier>, nftTicketRepository: Repository<NftTicket>, cacheManager: Cache);
    readonly eventJobHandlers: Record<EventBlockchain, (processor: BlockchainEventProcessor) => Promise<void>>;
    getKeyCache(eventBlockchain: EventBlockchain): string;
    runJob(eventBlockchain: EventBlockchain): Promise<void>;
    handleGetLatestBlock(eventBlockchain: EventBlockchain, currentBlock: number): Promise<number>;
    getCurrentBlockNumber(): Promise<number>;
    handleCreateEvent(eventName: string, lastBlockProcessed: number, toBlock: number): Promise<void>;
    handleTicketSoldEvent(eventName: string, lastBlockProcessed: number, toBlock: number): Promise<void>;
    handleResoldTicketEvent(eventName: string, lastBlockProcessed: number, toBlock: number): Promise<void>;
    handleCancelledResellTicketEvent(eventName: string, lastBlockProcessed: number, toBlock: number): Promise<void>;
    handleBoughtTicketEvent(eventName: string, lastBlockProcessed: number, toBlock: number): Promise<void>;
    queryEvents(eventName: string, fromBlock: number, toBlock: number): Promise<(import("ethers").Log | import("ethers").EventLog)[] | undefined>;
    getTransactionInfo(txHash: string): Promise<{
        transaction: import("ethers").TransactionResponse | null;
        receipt: import("ethers").TransactionReceipt | null;
        status: BlockchainSnapshotStatus;
        gasUsed: string | undefined;
        blockNumber: number | undefined;
        events: readonly import("ethers").Log[] | undefined;
    }>;
}
