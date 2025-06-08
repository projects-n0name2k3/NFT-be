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
var BlockchainEventProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainEventProcessor = exports.EventBlockchain = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const abi_config_1 = require("../config/abi.config");
const blockchain_snapshots_service_1 = require("../services/blockchain-snapshots.service");
const event_entity_1 = require("../entities/event.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const blockchain_snapshot_entity_1 = require("../entities/blockchain-snapshot.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const entities_1 = require("../entities");
const ticket_sale_transaction_entity_1 = require("../entities/ticket-sale-transaction.entity");
var EventBlockchain;
(function (EventBlockchain) {
    EventBlockchain["CREATE_EVENT"] = "CreatedEvent";
    EventBlockchain["TICKET_SOLD"] = "TicketSold";
    EventBlockchain["RESOLE_TICKET"] = "ResoldTicket";
    EventBlockchain["CANCELLED_RESELL_TICKET"] = "CancelledResellTicket";
    EventBlockchain["BOUGHT_TICKET"] = "BoughtTicket";
})(EventBlockchain || (exports.EventBlockchain = EventBlockchain = {}));
const keyCache = {
    [EventBlockchain.CREATE_EVENT]: 'latestBlockCreateEvent',
    [EventBlockchain.TICKET_SOLD]: 'latestBlockTicketSold',
    [EventBlockchain.RESOLE_TICKET]: 'latestBlockResoldTicket',
    [EventBlockchain.CANCELLED_RESELL_TICKET]: 'latestBlockCancelledResellTicket',
    [EventBlockchain.BOUGHT_TICKET]: 'latestBlockBoughtTicket',
};
let BlockchainEventProcessor = BlockchainEventProcessor_1 = class BlockchainEventProcessor {
    configService;
    blockchainSnapshotsService;
    blockchainSnapshotRepository;
    eventRepository;
    ticketSaleTransactionRepository;
    userRepository;
    ticketTierRepository;
    nftTicketRepository;
    cacheManager;
    logger = new common_1.Logger(BlockchainEventProcessor_1.name);
    ifaceEvent = new ethers_1.Interface(abi_config_1.AbiConfig.abiEvent);
    ifaceTicketSold = new ethers_1.Interface(abi_config_1.AbiConfig.ticketEvent);
    ifaceMarketplace = new ethers_1.Interface(abi_config_1.AbiConfig.marketplaceEvent);
    BATCH_SIZE;
    constructor(configService, blockchainSnapshotsService, blockchainSnapshotRepository, eventRepository, ticketSaleTransactionRepository, userRepository, ticketTierRepository, nftTicketRepository, cacheManager) {
        this.configService = configService;
        this.blockchainSnapshotsService = blockchainSnapshotsService;
        this.blockchainSnapshotRepository = blockchainSnapshotRepository;
        this.eventRepository = eventRepository;
        this.ticketSaleTransactionRepository = ticketSaleTransactionRepository;
        this.userRepository = userRepository;
        this.ticketTierRepository = ticketTierRepository;
        this.nftTicketRepository = nftTicketRepository;
        this.cacheManager = cacheManager;
        this.BATCH_SIZE = this.configService.getOrThrow('BATCH_SIZE');
    }
    eventJobHandlers = {
        [EventBlockchain.CREATE_EVENT]: async (processor) => await processor.runJob(EventBlockchain.CREATE_EVENT),
        [EventBlockchain.TICKET_SOLD]: async (processor) => await processor.runJob(EventBlockchain.TICKET_SOLD),
        [EventBlockchain.RESOLE_TICKET]: async (processor) => await processor.runJob(EventBlockchain.RESOLE_TICKET),
        [EventBlockchain.CANCELLED_RESELL_TICKET]: async (processor) => await processor.runJob(EventBlockchain.CANCELLED_RESELL_TICKET),
        [EventBlockchain.BOUGHT_TICKET]: async (processor) => await processor.runJob(EventBlockchain.BOUGHT_TICKET),
    };
    getKeyCache(eventBlockchain) {
        return keyCache[eventBlockchain] || 'Undefined';
    }
    async runJob(eventBlockchain) {
        this.logger.debug('Called when the current minute 1');
        let lastBlockProcessed;
        const cacheKey = this.getKeyCache(eventBlockchain);
        const currentBlock = await this.getCurrentBlockNumber();
        const latestBlock = await this.cacheManager.get(cacheKey);
        if (!latestBlock) {
            lastBlockProcessed = await this.handleGetLatestBlock(eventBlockchain, currentBlock);
        }
        else {
            lastBlockProcessed = Number(latestBlock);
        }
        const MAX_BLOCKS_PER_QUERY = 500;
        while (lastBlockProcessed < currentBlock) {
            let toBlock = lastBlockProcessed + Math.min(this.BATCH_SIZE, MAX_BLOCKS_PER_QUERY);
            if (toBlock > currentBlock) {
                toBlock = currentBlock;
            }
            try {
                switch (eventBlockchain) {
                    case EventBlockchain.CREATE_EVENT:
                        await this.handleCreateEvent(eventBlockchain, lastBlockProcessed, toBlock);
                        break;
                    case EventBlockchain.TICKET_SOLD:
                        await this.handleTicketSoldEvent(eventBlockchain, lastBlockProcessed, toBlock);
                        break;
                    case EventBlockchain.RESOLE_TICKET:
                        await this.handleResoldTicketEvent(eventBlockchain, lastBlockProcessed, toBlock);
                        break;
                    case EventBlockchain.CANCELLED_RESELL_TICKET:
                        await this.handleCancelledResellTicketEvent(eventBlockchain, lastBlockProcessed, toBlock);
                        break;
                    case EventBlockchain.BOUGHT_TICKET:
                        await this.handleBoughtTicketEvent(eventBlockchain, lastBlockProcessed, toBlock);
                        break;
                }
                lastBlockProcessed = toBlock;
                await this.cacheManager.set(cacheKey, lastBlockProcessed, this.configService.get('OTP_CACHE_TTL'));
            }
            catch (error) {
                this.logger.error(`Error processing blocks ${lastBlockProcessed} to ${toBlock}: ${error.message}`);
                if (error.error?.message?.includes('block range')) {
                    this.logger.warn(`Reducing batch size to ${this.BATCH_SIZE}`);
                    continue;
                }
                throw error;
            }
        }
    }
    async handleGetLatestBlock(eventBlockchain, currentBlock) {
        switch (eventBlockchain) {
            case EventBlockchain.CREATE_EVENT:
                return ((await this.blockchainSnapshotsService.getLatestBlockFromDb(EventBlockchain.CREATE_EVENT)) || currentBlock - 1);
            case EventBlockchain.TICKET_SOLD:
                return ((await this.blockchainSnapshotsService.getLatestBlockFromDb(EventBlockchain.TICKET_SOLD)) || currentBlock - 1);
            case EventBlockchain.RESOLE_TICKET:
                return ((await this.blockchainSnapshotsService.getLatestBlockFromDb(EventBlockchain.RESOLE_TICKET)) || currentBlock - 1);
            case EventBlockchain.CANCELLED_RESELL_TICKET:
                return ((await this.blockchainSnapshotsService.getLatestBlockFromDb(EventBlockchain.CANCELLED_RESELL_TICKET)) || currentBlock - 1);
            case EventBlockchain.BOUGHT_TICKET:
                return ((await this.blockchainSnapshotsService.getLatestBlockFromDb(EventBlockchain.BOUGHT_TICKET)) || currentBlock - 1);
        }
    }
    async getCurrentBlockNumber() {
        return await abi_config_1.AbiConfig.provider.getBlockNumber();
    }
    async handleCreateEvent(eventName, lastBlockProcessed, toBlock) {
        const events = await this.queryEvents(eventName, lastBlockProcessed, toBlock);
        if (!events || events.length === 0) {
            console.log('No events found');
            return;
        }
        for (const event of events) {
            const transactionHash = event.transactionHash;
            const result = await this.getTransactionInfo(transactionHash);
            const parsedEventLog = this.ifaceEvent.parseLog(event);
            console.log('parsedEventLog CreateEvent', parsedEventLog);
            const eventData = {
                eventId: parsedEventLog?.args[0]?.toString(),
                sender: parsedEventLog?.args[1],
                _saleRule: parsedEventLog?.args[2]?.toString(),
                _eventMetadataURL: parsedEventLog?.args[3],
            };
            let ticketAddress;
            try {
                async function getEventWithRetry(eventId, retries = 5) {
                    for (let i = 0; i < retries; i++) {
                        try {
                            const event = await abi_config_1.AbiConfig.eventcontract.events(eventId);
                            if (event?.ticketAddress)
                                return event;
                        }
                        catch (err) {
                            console.warn(`Retry ${i + 1}/${retries} - Waiting for event(${eventId}) to be available...`);
                            if (i === retries - 1)
                                throw err;
                            await new Promise((res) => setTimeout(res, 1000));
                        }
                    }
                }
                const eventResult = await getEventWithRetry(eventData.eventId);
                ticketAddress = eventResult.ticketAddress;
            }
            catch (error) {
                console.error('❌ Error fetching ticket address:', error);
                throw new Error('Failed to get ticket address');
            }
            if (!result) {
                console.warn(`❌ Transaction info not found for hash: ${transactionHash}`);
                continue;
            }
            const blockchainSnapshot = await this.blockchainSnapshotRepository.findOneBy({
                transactionHash,
            });
            async function getEventRecordWithRetry(txHash, retries = 5) {
                for (let i = 0; i < retries; i++) {
                    const event = await this.eventRepository.findOneBy({
                        transactionHash: txHash,
                    });
                    if (event)
                        return event;
                    console.warn(`⏳ Retry ${i + 1}/${retries} - Waiting for event(${txHash}) to be available...`);
                    await new Promise((res) => setTimeout(res, 1000));
                }
                return null;
            }
            if (!blockchainSnapshot) {
                const newSnapshot = this.blockchainSnapshotRepository.create({
                    blockNumber: result.blockNumber,
                    transactionHash,
                    eventName: EventBlockchain.CREATE_EVENT,
                    eventData: eventData,
                    status: result.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS
                        ? blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS
                        : blockchain_snapshot_entity_1.BlockchainSnapshotStatus.FAILED,
                });
                await this.blockchainSnapshotRepository.save(newSnapshot);
                const existingEvent = await getEventRecordWithRetry.call(this, transactionHash);
                if (existingEvent) {
                    existingEvent.status = event_entity_1.EventStatus.PUBLISHED;
                    existingEvent.onChainId = eventData.eventId;
                    existingEvent.ticketAddress = ticketAddress;
                    await this.eventRepository.save(existingEvent);
                }
            }
            else {
                const existingEvent = await getEventRecordWithRetry.call(this, transactionHash);
                if (!existingEvent) {
                    console.warn(`⚠️ No matching event found in DB for tx: ${transactionHash}`);
                    continue;
                }
                existingEvent.status = event_entity_1.EventStatus.PUBLISHED;
                existingEvent.onChainId = eventData.eventId;
                existingEvent.ticketAddress = ticketAddress;
                await this.eventRepository.save(existingEvent);
                console.log(`✅ Event ${existingEvent.id} updated with onChainId & ticketAddress`);
            }
        }
    }
    async handleTicketSoldEvent(eventName, lastBlockProcessed, toBlock) {
        const events = await this.queryEvents(eventName, lastBlockProcessed, toBlock);
        if (!events || events.length === 0) {
            console.log('No events found');
            return;
        }
        for (const event of events) {
            const transactionHash = event.transactionHash;
            console.log(event);
            const result = await this.getTransactionInfo(transactionHash);
            const parsedEventLog = this.ifaceTicketSold.parseLog(event);
            console.log('parsedEventLog TicketSold', parsedEventLog);
            if (!parsedEventLog)
                return;
            const [_onchainId, _tierId, _amount, _buyer, _totalPayInUSDT] = parsedEventLog.args;
            const blockchainSnapshot = await this.blockchainSnapshotRepository.findOneBy({
                transactionHash: transactionHash,
            });
            if (!blockchainSnapshot) {
                const eventData = {
                    onchainId: Number(_onchainId),
                    tierId: _tierId.toString(),
                    quantity: Number(_amount),
                    sender: _buyer,
                    totalPayInUSDT: Number(_totalPayInUSDT),
                };
                const newSnapshot = this.blockchainSnapshotRepository.create({
                    blockNumber: result.blockNumber,
                    transactionHash,
                    eventName: EventBlockchain.TICKET_SOLD,
                    eventData: eventData,
                });
                if ((result.status = blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS)) {
                    newSnapshot.status = blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS;
                    const event = await this.eventRepository.findOne({
                        where: { onChainId: Number(_onchainId) },
                        relations: ['user'],
                    });
                    console.log('eventaaaaaaaaaaaaaaa', event);
                    if (!event || !event.user) {
                        continue;
                    }
                    else {
                        const user = await this.userRepository.findOneBy({
                            id: event.user.id,
                        });
                        if (!user) {
                            throw new common_1.BadRequestException('User not found');
                        }
                        const ticketTier = await this.ticketTierRepository.findOne({
                            where: {
                                tierIndex: eventData.tierId,
                                event: { id: event.id },
                            },
                        });
                        const ticketTierEntity = await this.ticketTierRepository.findOne({
                            where: { id: ticketTier?.id },
                        });
                        const ticketSaleTransaction = this.ticketSaleTransactionRepository.create({
                            buyerWalletAddress: eventData.sender,
                            initialQuantity: eventData.quantity,
                            remainingQuantity: eventData.quantity,
                            pricePerTicket: eventData.totalPayInUSDT,
                            transactionHash: transactionHash,
                            sellerWalletAddress: user?.walletAddress,
                            status: ticket_sale_transaction_entity_1.TicketSaleStatus.SELLING,
                        });
                        if (ticketTierEntity) {
                            ticketSaleTransaction.ticketTier = ticketTierEntity;
                        }
                        await this.blockchainSnapshotRepository.save(newSnapshot);
                        const transactionData = await this.ticketSaleTransactionRepository.save(ticketSaleTransaction);
                        const userData = await this.userRepository.findOneBy({
                            walletAddress: transactionData.buyerWalletAddress,
                        });
                        const existingNftTicket = await this.nftTicketRepository.findOne({
                            where: {
                                owner: { id: userData?.id },
                                ticketTier: { id: ticketTier?.id },
                            },
                        });
                        if (existingNftTicket) {
                            existingNftTicket.quantity += transactionData.initialQuantity;
                            await this.nftTicketRepository.save(existingNftTicket);
                        }
                        else {
                            const nftTicketData = {
                                owner: { id: userData?.id },
                                quantity: transactionData.initialQuantity,
                                ticketTier: { id: ticketTier?.id },
                            };
                            await this.nftTicketRepository.insert(nftTicketData);
                        }
                    }
                }
                else {
                    newSnapshot.status = blockchain_snapshot_entity_1.BlockchainSnapshotStatus.FAILED;
                    await this.blockchainSnapshotRepository.save(newSnapshot);
                }
            }
        }
    }
    async handleResoldTicketEvent(eventName, lastBlockProcessed, toBlock) {
        const events = await this.queryEvents(eventName, lastBlockProcessed, toBlock);
        if (!events || events.length === 0) {
            console.log('No resold ticket events found', lastBlockProcessed, toBlock);
            return;
        }
        for (const event of events) {
            const transactionHash = event.transactionHash;
            const result = await this.getTransactionInfo(transactionHash);
            const parsedEventLog = this.ifaceMarketplace.parseLog(event);
            console.log('parsedEventLog ResoldTicket', parsedEventLog);
            const saleId = Number(parsedEventLog?.args['saleId']);
            const eventId = Number(parsedEventLog?.args['eventId']);
            const seller = parsedEventLog?.args['seller'];
            const ticketAddress = parsedEventLog?.args['ticketAddress'];
            const ticketTier = Number(parsedEventLog?.args['ticketTier']);
            const pricePerTicket = Number(parsedEventLog?.args['pricePerTicket']);
            const initialAmount = Number(parsedEventLog?.args['initialAmount']);
            if (result) {
                const blockchainSnapshot = await this.blockchainSnapshotRepository.findOneBy({
                    transactionHash,
                });
                if (!blockchainSnapshot) {
                    try {
                        await this.blockchainSnapshotRepository.manager.transaction(async (manager) => {
                            const newSnapshot = manager.create(blockchain_snapshot_entity_1.BlockchainSnapshot, {
                                blockNumber: result.blockNumber,
                                transactionHash,
                                eventName: EventBlockchain.RESOLE_TICKET,
                                eventData: {
                                    saleId: saleId,
                                    seller,
                                    ticketTier,
                                    pricePerTicket,
                                    initialAmount,
                                },
                                status: result.status,
                            });
                            await manager.save(newSnapshot);
                            if (result.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS) {
                                const savedTicketSaleTransaction = await manager.findOne(entities_1.TicketSaleTransaction, {
                                    where: {
                                        saleId,
                                        transactionHash,
                                    },
                                });
                                if (!savedTicketSaleTransaction) {
                                    const ticketTierRecord = await manager.findOne(entities_1.TicketTier, {
                                        where: {
                                            tierIndex: ticketTier,
                                            event: { onChainId: eventId },
                                        },
                                        relations: ['event'],
                                    });
                                    if (!ticketTierRecord) {
                                        throw new common_1.BadRequestException('TicketTier not found');
                                    }
                                    const ticketSaleTransaction = manager.create(entities_1.TicketSaleTransaction, {
                                        saleId,
                                        sellerWalletAddress: seller,
                                        transactionHash,
                                        pricePerTicket,
                                        initialQuantity: initialAmount,
                                        remainingQuantity: initialAmount,
                                        status: ticket_sale_transaction_entity_1.TicketSaleStatus.SELLING,
                                        ticketTier: ticketTierRecord,
                                    });
                                    await manager.save(ticketSaleTransaction);
                                }
                                else {
                                    savedTicketSaleTransaction.pricePerTicket = pricePerTicket;
                                    savedTicketSaleTransaction.initialQuantity = initialAmount;
                                    savedTicketSaleTransaction.remainingQuantity =
                                        initialAmount;
                                    savedTicketSaleTransaction.status =
                                        ticket_sale_transaction_entity_1.TicketSaleStatus.SELLING;
                                    await manager.save(savedTicketSaleTransaction);
                                }
                                const nftTicket = await manager.findOne(entities_1.NftTicket, {
                                    where: {
                                        owner: { walletAddress: seller },
                                        ticketTier: {
                                            tierIndex: ticketTier,
                                            event: { onChainId: eventId },
                                        },
                                    },
                                });
                                if (!nftTicket) {
                                    throw new common_1.BadRequestException('Something went wrong');
                                }
                                nftTicket.quantity -= initialAmount;
                                if (nftTicket.quantity < 0) {
                                    throw new common_1.BadRequestException('Nft ticket quantity is not enough');
                                }
                                await manager.save(nftTicket);
                            }
                            else {
                                await manager.delete(blockchain_snapshot_entity_1.BlockchainSnapshot, { transactionHash });
                            }
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    }
    async handleCancelledResellTicketEvent(eventName, lastBlockProcessed, toBlock) {
        const events = await this.queryEvents(eventName, lastBlockProcessed, toBlock);
        if (!events || events.length === 0) {
            console.log('No events found');
            return;
        }
        for (const event of events) {
            const transactionHash = event.transactionHash;
            const result = await this.getTransactionInfo(transactionHash);
            const parsedEventLog = this.ifaceMarketplace.parseLog(event);
            console.log('parsedEventLog CancelledResell', parsedEventLog);
            const saleId = Number(parsedEventLog?.args['saleId']);
            const seller = parsedEventLog?.args['seller'];
            if (result) {
                const blockchainSnapshot = await this.blockchainSnapshotRepository.findOneBy({
                    transactionHash,
                });
                if (!blockchainSnapshot) {
                    try {
                        await this.blockchainSnapshotRepository.manager.transaction(async (manager) => {
                            const newSnapshot = manager.create(blockchain_snapshot_entity_1.BlockchainSnapshot, {
                                blockNumber: result.blockNumber,
                                transactionHash,
                                eventName: EventBlockchain.CANCELLED_RESELL_TICKET,
                                eventData: {
                                    saleId: saleId,
                                    seller,
                                },
                                status: result.status,
                            });
                            await manager.save(newSnapshot);
                            if (result.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS) {
                                const ticketSaleTransaction = await manager.findOne(entities_1.TicketSaleTransaction, {
                                    where: { saleId, sellerWalletAddress: seller },
                                    relations: { ticketTier: true },
                                });
                                if (!ticketSaleTransaction) {
                                    throw new common_1.BadRequestException('Ticket sale transaction not found');
                                }
                                await manager.update(entities_1.TicketSaleTransaction, { saleId }, { status: ticket_sale_transaction_entity_1.TicketSaleStatus.CLOSED });
                                const nftTicket = await manager.findOne(entities_1.NftTicket, {
                                    where: {
                                        owner: {
                                            walletAddress: ticketSaleTransaction?.sellerWalletAddress,
                                        },
                                        ticketTier: { id: ticketSaleTransaction?.ticketTier.id },
                                    },
                                });
                                await manager.update(entities_1.NftTicket, { id: nftTicket?.id }, {
                                    quantity: () => `quantity + ${ticketSaleTransaction?.remainingQuantity}`,
                                });
                            }
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    }
    async handleBoughtTicketEvent(eventName, lastBlockProcessed, toBlock) {
        const events = await this.queryEvents(eventName, lastBlockProcessed, toBlock);
        if (!events || events.length === 0) {
            console.log('No events found');
            return;
        }
        for (const event of events) {
            const transactionHash = event.transactionHash;
            const result = await this.getTransactionInfo(transactionHash);
            const parsedEventLog = this.ifaceMarketplace.parseLog(event);
            const saleId = Number(parsedEventLog?.args['saleId']);
            const buyer = parsedEventLog?.args['buyer'];
            const amount = Number(parsedEventLog?.args['amount']);
            const totalPrice = Number(parsedEventLog?.args['totalPrice']);
            if (result) {
                const blockchainSnapshot = await this.blockchainSnapshotRepository.findOneBy({
                    transactionHash,
                });
                if (!blockchainSnapshot) {
                    try {
                        await this.blockchainSnapshotRepository.manager.transaction(async (manager) => {
                            const newBlockchainSnapshot = manager.create(blockchain_snapshot_entity_1.BlockchainSnapshot, {
                                blockNumber: result.blockNumber,
                                transactionHash,
                                eventName: EventBlockchain.BOUGHT_TICKET,
                                eventData: {
                                    saleId: saleId,
                                    buyer,
                                    amount,
                                    totalPrice,
                                },
                                status: result.status,
                            });
                            await manager.save(newBlockchainSnapshot);
                            if (result.status === blockchain_snapshot_entity_1.BlockchainSnapshotStatus.FAILED) {
                                await manager.delete(entities_1.TicketSaleTransaction, {
                                    transactionHash,
                                    buyerWalletAddress: buyer,
                                });
                            }
                            else {
                                const savedTicketSaleTransaction = await manager.findOne(entities_1.TicketSaleTransaction, {
                                    where: {
                                        saleId,
                                    },
                                    relations: {
                                        ticketTier: true,
                                    },
                                });
                                if (!savedTicketSaleTransaction) {
                                    throw new common_1.BadRequestException('Ticket sale transaction not found');
                                }
                                savedTicketSaleTransaction.remainingQuantity -= amount;
                                if (savedTicketSaleTransaction.remainingQuantity === 0) {
                                    savedTicketSaleTransaction.status = ticket_sale_transaction_entity_1.TicketSaleStatus.SOLD;
                                }
                                await manager.save(savedTicketSaleTransaction);
                                const pendingTicketSaleTransaction = await manager.findOne(entities_1.TicketSaleTransaction, {
                                    where: {
                                        transactionHash,
                                    },
                                });
                                if (pendingTicketSaleTransaction) {
                                    pendingTicketSaleTransaction.status = ticket_sale_transaction_entity_1.TicketSaleStatus.SOLD;
                                    await manager.save(pendingTicketSaleTransaction);
                                    console.log('pendingTicketSaleTransaction', pendingTicketSaleTransaction);
                                }
                                else {
                                    const newTicketSaleTransaction = manager.create(entities_1.TicketSaleTransaction, {
                                        sellerWalletAddress: savedTicketSaleTransaction.sellerWalletAddress,
                                        buyerWalletAddress: buyer,
                                        transactionHash,
                                        pricePerTicket: savedTicketSaleTransaction.pricePerTicket,
                                        initialQuantity: amount,
                                        status: ticket_sale_transaction_entity_1.TicketSaleStatus.SOLD,
                                        ticketTier: {
                                            id: savedTicketSaleTransaction.ticketTier.id,
                                        },
                                    });
                                    await manager.save(newTicketSaleTransaction);
                                    console.log('newTicketSaleTransaction', newTicketSaleTransaction);
                                }
                                const savedNftTicket = await manager.findOne(entities_1.NftTicket, {
                                    where: {
                                        owner: { walletAddress: buyer },
                                        ticketTier: {
                                            id: savedTicketSaleTransaction.ticketTier.id,
                                        },
                                    },
                                });
                                if (!savedNftTicket) {
                                    const user = await manager.findOne(entities_1.User, {
                                        where: { walletAddress: buyer },
                                    });
                                    if (!user) {
                                        throw new common_1.BadRequestException('User not found');
                                    }
                                    const newNftTicket = manager.create(entities_1.NftTicket, {
                                        owner: user,
                                        ticketTier: {
                                            id: savedTicketSaleTransaction.ticketTier.id,
                                        },
                                        quantity: amount,
                                    });
                                    await manager.save(newNftTicket);
                                }
                                else {
                                    savedNftTicket.quantity += amount;
                                    await manager.save(savedNftTicket);
                                }
                            }
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    }
    async queryEvents(eventName, fromBlock, toBlock) {
        if (toBlock - fromBlock > 500) {
            toBlock = fromBlock + 500;
        }
        try {
            switch (eventName) {
                case EventBlockchain.CREATE_EVENT:
                    return await abi_config_1.AbiConfig.eventcontract.queryFilter(eventName, fromBlock, toBlock);
                case EventBlockchain.TICKET_SOLD:
                    return await abi_config_1.AbiConfig.ticketcontract.queryFilter(eventName, fromBlock, toBlock);
                case EventBlockchain.RESOLE_TICKET:
                    return await abi_config_1.AbiConfig.marketplacecontract.queryFilter(eventName, fromBlock, toBlock);
                case EventBlockchain.CANCELLED_RESELL_TICKET:
                    return await abi_config_1.AbiConfig.marketplacecontract.queryFilter(eventName, fromBlock, toBlock);
                case EventBlockchain.BOUGHT_TICKET:
                    return await abi_config_1.AbiConfig.marketplacecontract.queryFilter(eventName, fromBlock, toBlock);
            }
        }
        catch (error) {
            this.logger.error(`Error querying events from block ${fromBlock} to ${toBlock}: ${error.message}`);
            throw error;
        }
    }
    async getTransactionInfo(txHash) {
        try {
            const tx = await abi_config_1.AbiConfig.provider.getTransaction(txHash);
            const receipt = await abi_config_1.AbiConfig.provider.getTransactionReceipt(txHash);
            return {
                transaction: tx,
                receipt: receipt,
                status: receipt?.status === 1
                    ? blockchain_snapshot_entity_1.BlockchainSnapshotStatus.SUCCESS
                    : blockchain_snapshot_entity_1.BlockchainSnapshotStatus.FAILED,
                gasUsed: receipt?.gasUsed.toString(),
                blockNumber: receipt?.blockNumber,
                events: receipt?.logs,
            };
        }
        catch (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
    }
};
exports.BlockchainEventProcessor = BlockchainEventProcessor;
exports.BlockchainEventProcessor = BlockchainEventProcessor = BlockchainEventProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(blockchain_snapshot_entity_1.BlockchainSnapshot)),
    __param(3, (0, typeorm_2.InjectRepository)(event_entity_1.Event)),
    __param(4, (0, typeorm_2.InjectRepository)(entities_1.TicketSaleTransaction)),
    __param(5, (0, typeorm_2.InjectRepository)(entities_1.User)),
    __param(6, (0, typeorm_2.InjectRepository)(entities_1.TicketTier)),
    __param(7, (0, typeorm_2.InjectRepository)(entities_1.NftTicket)),
    __param(8, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        blockchain_snapshots_service_1.BlockchainSnapshotsService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository, Object])
], BlockchainEventProcessor);
//# sourceMappingURL=blockchain-event-processor.service.js.map