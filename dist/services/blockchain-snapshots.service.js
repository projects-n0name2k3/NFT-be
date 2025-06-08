"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainSnapshotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const blockchain_snapshot_entity_1 = require("../entities/blockchain-snapshot.entity");
const ticket_sale_transaction_entity_1 = require("../entities/ticket-sale-transaction.entity");
const typeorm_2 = require("typeorm");
let BlockchainSnapshotsService = class BlockchainSnapshotsService {
    blockchainSnapshotRepository;
    ticketTierRepository;
    ticketSaleTransactionRepository;
    constructor(blockchainSnapshotRepository, ticketTierRepository, ticketSaleTransactionRepository) {
        this.blockchainSnapshotRepository = blockchainSnapshotRepository;
        this.ticketTierRepository = ticketTierRepository;
        this.ticketSaleTransactionRepository = ticketSaleTransactionRepository;
    }
    async getTransactionByHash(transactionHash) {
        const transaction = await this.blockchainSnapshotRepository.findOne({
            where: { transactionHash },
        });
        return transaction;
    }
    async getLatestBlockFromDb(eventName) {
        const result = await this.blockchainSnapshotRepository
            .createQueryBuilder('snapshot')
            .select('MAX(snapshot.block_number)', 'maxBlock')
            .where('snapshot.event_name = :eventName', { eventName })
            .getRawOne();
        if (result && result.maxBlock != null) {
            return Number(result.maxBlock);
        }
        console.log(`No block found for ${eventName}, returning 0`);
        return 0;
    }
    async verifyResaleCreationStatus({ eventId, ticketTier, pricePerTicket, amount, transactionHash, }, user) {
        const savedTicketTier = await this.ticketTierRepository.findOne({
            where: {
                tierIndex: ticketTier,
                event: { onChainId: eventId },
            },
        });
        if (!savedTicketTier) {
            throw new common_1.NotFoundException('Ticket tier not found');
        }
        const savedBlockchainSnapshot = await this.blockchainSnapshotRepository.findOne({
            where: { transactionHash },
        });
        if (!savedBlockchainSnapshot) {
            const savedTicketSaleTransaction = await this.ticketSaleTransactionRepository.findOne({
                where: [{ transactionHash }],
            });
            if (savedTicketSaleTransaction) {
                return 'pending';
            }
            const draftTicketSaleTransaction = this.ticketSaleTransactionRepository.create({
                sellerWalletAddress: user.walletAddress,
                transactionHash,
                pricePerTicket,
                initialQuantity: amount,
                remainingQuantity: amount,
                status: ticket_sale_transaction_entity_1.TicketSaleStatus.DRAFT,
                ticketTier: { id: savedTicketTier.id },
            });
            await this.ticketSaleTransactionRepository.save(draftTicketSaleTransaction);
            return 'pending';
        }
        else if (savedBlockchainSnapshot &&
            savedBlockchainSnapshot.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS) {
            return 'success';
        }
        else {
            return 'failed';
        }
    }
    async verifyResaleCancellationStatus({ saleId, transactionHash }, user) {
        console.log(user);
        const savedTicketSaleTransaction = await this.ticketSaleTransactionRepository.findOne({
            where: {
                saleId,
                sellerWalletAddress: user.walletAddress,
            },
        });
        if (!savedTicketSaleTransaction) {
            throw new common_1.NotFoundException('Ticket resale not found');
        }
        if (savedTicketSaleTransaction.status === ticket_sale_transaction_entity_1.TicketSaleStatus.CLOSED) {
            return 'success';
        }
        const savedBlockchainSnapshot = await this.blockchainSnapshotRepository.findOne({
            where: {
                transactionHash,
            },
        });
        if (!savedBlockchainSnapshot) {
            return 'pending';
        }
        if (savedBlockchainSnapshot.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS) {
            return 'success';
        }
        return 'failed';
    }
    async verifyBuyResaleTicketStatus({ saleId, amount, transactionHash }, user) {
        const savedTicketSaleTransaction = await this.ticketSaleTransactionRepository.findOne({
            where: {
                saleId,
            },
            relations: {
                ticketTier: true,
            },
        });
        if (!savedTicketSaleTransaction) {
            throw new common_1.NotFoundException('Ticket sale transaction not found');
        }
        const savedBlockchainSnapshot = await this.blockchainSnapshotRepository.findOne({
            where: { transactionHash },
        });
        if (!savedBlockchainSnapshot) {
            let savedCurrentTicketSaleTransaction = await this.ticketSaleTransactionRepository.findOne({
                where: {
                    transactionHash,
                },
            });
            if (!savedCurrentTicketSaleTransaction) {
                const currentTicketSaleTransaction = this.ticketSaleTransactionRepository.create({
                    sellerWalletAddress: savedTicketSaleTransaction.sellerWalletAddress,
                    buyerWalletAddress: user.walletAddress,
                    transactionHash,
                    pricePerTicket: savedTicketSaleTransaction.pricePerTicket,
                    initialQuantity: amount,
                    status: ticket_sale_transaction_entity_1.TicketSaleStatus.PENDING,
                    ticketTier: { id: savedTicketSaleTransaction.ticketTier.id },
                });
                await this.ticketSaleTransactionRepository.save(currentTicketSaleTransaction);
            }
            return 'pending';
        }
        if (savedBlockchainSnapshot.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS) {
            return 'success';
        }
        return 'failed';
    }
};
exports.BlockchainSnapshotsService = BlockchainSnapshotsService;
exports.BlockchainSnapshotsService = BlockchainSnapshotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BlockchainSnapshot)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.TicketTier)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.TicketSaleTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BlockchainSnapshotsService);
//# sourceMappingURL=blockchain-snapshots.service.js.map