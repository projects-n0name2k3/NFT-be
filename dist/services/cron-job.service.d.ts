import { BlockchainEventProcessor } from './blockchain-event-processor.service';
export declare class CronService {
    private readonly blockchainEventProcessor;
    private isRunning;
    private readonly logger;
    private readonly eventTypes;
    constructor(blockchainEventProcessor: BlockchainEventProcessor);
    handleEvent(): Promise<void>;
    handleCron(eventType: string): Promise<void>;
}
