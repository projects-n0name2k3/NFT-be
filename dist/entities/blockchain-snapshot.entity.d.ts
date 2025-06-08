import { BaseEntity } from './baseEntity';
export declare enum BlockchainSnapshotStatus {
    SUCCESS = "success",
    FAILED = "failed"
}
export declare class BlockchainSnapshot extends BaseEntity {
    blockNumber: number;
    transactionHash: string;
    eventName: string;
    eventData: object;
    status: BlockchainSnapshotStatus;
}
