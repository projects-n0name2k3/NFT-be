import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Interface } from 'ethers';
import { AbiConfig } from 'src/config/abi.config';
import { BlockchainSnapshotsService } from 'src/services/blockchain-snapshots.service';
import { EventStatus, Event } from 'src/entities/event.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BlockchainSnapshot,
  BlockchainSnapshotStatus,
} from 'src/entities/blockchain-snapshot.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  NftTicket,
  TicketSaleTransaction,
  TicketTier,
  User,
} from 'src/entities';
import { TicketSaleStatus } from 'src/entities/ticket-sale-transaction.entity';

export enum EventBlockchain {
  CREATE_EVENT = 'CreatedEvent',
  TICKET_SOLD = 'TicketSold',
  RESOLE_TICKET = 'ResoldTicket',
  CANCELLED_RESELL_TICKET = 'CancelledResellTicket',
  BOUGHT_TICKET = 'BoughtTicket',
}

const keyCache: Record<EventBlockchain, string> = {
  [EventBlockchain.CREATE_EVENT]: 'latestBlockCreateEvent',
  [EventBlockchain.TICKET_SOLD]: 'latestBlockTicketSold',
  [EventBlockchain.RESOLE_TICKET]: 'latestBlockResoldTicket',
  [EventBlockchain.CANCELLED_RESELL_TICKET]: 'latestBlockCancelledResellTicket',
  [EventBlockchain.BOUGHT_TICKET]: 'latestBlockBoughtTicket',
};

@Injectable()
export class BlockchainEventProcessor {
  private readonly logger = new Logger(BlockchainEventProcessor.name);
  private readonly ifaceEvent = new Interface(AbiConfig.abiEvent);
  private readonly ifaceTicketSold = new Interface(AbiConfig.ticketEvent);
  private readonly ifaceMarketplace = new Interface(AbiConfig.marketplaceEvent);
  private readonly BATCH_SIZE;
  constructor(
    private readonly configService: ConfigService,
    private readonly blockchainSnapshotsService: BlockchainSnapshotsService,
    @InjectRepository(BlockchainSnapshot)
    private readonly blockchainSnapshotRepository: Repository<BlockchainSnapshot>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketSaleTransaction)
    private readonly ticketSaleTransactionRepository: Repository<TicketSaleTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(NftTicket)
    private readonly nftTicketRepository: Repository<NftTicket>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.BATCH_SIZE = this.configService.getOrThrow<number>('BATCH_SIZE');
  }

  public readonly eventJobHandlers: Record<
    EventBlockchain,
    (processor: BlockchainEventProcessor) => Promise<void>
  > = {
    [EventBlockchain.CREATE_EVENT]: async (processor) =>
      await processor.runJob(EventBlockchain.CREATE_EVENT),
    [EventBlockchain.TICKET_SOLD]: async (processor) =>
      await processor.runJob(EventBlockchain.TICKET_SOLD),
    [EventBlockchain.RESOLE_TICKET]: async (processor) =>
      await processor.runJob(EventBlockchain.RESOLE_TICKET),
    [EventBlockchain.CANCELLED_RESELL_TICKET]: async (processor) =>
      await processor.runJob(EventBlockchain.CANCELLED_RESELL_TICKET),
    [EventBlockchain.BOUGHT_TICKET]: async (processor) =>
      await processor.runJob(EventBlockchain.BOUGHT_TICKET),
  };

  public getKeyCache(eventBlockchain: EventBlockchain): string {
    return keyCache[eventBlockchain] || 'Undefined';
  }

  public async runJob(eventBlockchain: EventBlockchain) {
    this.logger.debug('Called when the current minute 1');
    let lastBlockProcessed: number;
    const cacheKey = this.getKeyCache(eventBlockchain);
    const currentBlock = await this.getCurrentBlockNumber();
    const latestBlock = await this.cacheManager.get<number>(cacheKey);

    if (!latestBlock) {
      lastBlockProcessed = await this.handleGetLatestBlock(
        eventBlockchain,
        currentBlock,
      );
    } else {
      lastBlockProcessed = Number(latestBlock);
    }

    // Maximum number of blocks to query at once (respect provider's limit)
    const MAX_BLOCKS_PER_QUERY = 500;

    while (lastBlockProcessed < currentBlock) {
      // Calculate the next block range to process, respecting the MAX_BLOCKS_PER_QUERY limit
      let toBlock =
        lastBlockProcessed + Math.min(this.BATCH_SIZE, MAX_BLOCKS_PER_QUERY);
      if (toBlock > currentBlock) {
        toBlock = currentBlock;
      }

      try {
        switch (eventBlockchain) {
          case EventBlockchain.CREATE_EVENT:
            await this.handleCreateEvent(
              eventBlockchain,
              lastBlockProcessed,
              toBlock,
            );
            break;
          case EventBlockchain.TICKET_SOLD:
            await this.handleTicketSoldEvent(
              eventBlockchain,
              lastBlockProcessed,
              toBlock,
            );
            break;
          case EventBlockchain.RESOLE_TICKET:
            await this.handleResoldTicketEvent(
              eventBlockchain,
              lastBlockProcessed,
              toBlock,
            );
            break;
          case EventBlockchain.CANCELLED_RESELL_TICKET:
            await this.handleCancelledResellTicketEvent(
              eventBlockchain,
              lastBlockProcessed,
              toBlock,
            );
            break;
          case EventBlockchain.BOUGHT_TICKET:
            await this.handleBoughtTicketEvent(
              eventBlockchain,
              lastBlockProcessed,
              toBlock,
            );
            break;
        }

        // Update the last processed block
        lastBlockProcessed = toBlock;

        // Cache the last processed block
        await this.cacheManager.set(
          cacheKey,
          lastBlockProcessed,
          this.configService.get<number>('OTP_CACHE_TTL'),
        );
      } catch (error) {
        this.logger.error(
          `Error processing blocks ${lastBlockProcessed} to ${toBlock}: ${error.message}`,
        );

        // If the error indicates a block range issue, reduce the range and try again
        if (error.error?.message?.includes('block range')) {
          // Cut the batch size in half and try again (but don't exceed MAX_BLOCKS_PER_QUERY)
          this.logger.warn(`Reducing batch size to ${this.BATCH_SIZE}`);

          // Don't update lastBlockProcessed so we retry with a smaller range
          continue;
        }

        // For other errors, we can either throw or log and continue
        throw error;
      }
    }
  }

  public async handleGetLatestBlock(
    eventBlockchain: EventBlockchain,
    currentBlock: number,
  ): Promise<number> {
    switch (eventBlockchain) {
      case EventBlockchain.CREATE_EVENT:
        return (
          (await this.blockchainSnapshotsService.getLatestBlockFromDb(
            EventBlockchain.CREATE_EVENT,
          )) || currentBlock - 1
        );
      case EventBlockchain.TICKET_SOLD:
        return (
          (await this.blockchainSnapshotsService.getLatestBlockFromDb(
            EventBlockchain.TICKET_SOLD,
          )) || currentBlock - 1
        );
      case EventBlockchain.RESOLE_TICKET:
        return (
          (await this.blockchainSnapshotsService.getLatestBlockFromDb(
            EventBlockchain.RESOLE_TICKET,
          )) || currentBlock - 1
        );
      case EventBlockchain.CANCELLED_RESELL_TICKET:
        return (
          (await this.blockchainSnapshotsService.getLatestBlockFromDb(
            EventBlockchain.CANCELLED_RESELL_TICKET,
          )) || currentBlock - 1
        );
      case EventBlockchain.BOUGHT_TICKET:
        return (
          (await this.blockchainSnapshotsService.getLatestBlockFromDb(
            EventBlockchain.BOUGHT_TICKET,
          )) || currentBlock - 1
        );
    }
  }

  public async getCurrentBlockNumber(): Promise<number> {
    return await AbiConfig.provider.getBlockNumber();
  }

  public async handleCreateEvent(
    eventName: string,
    lastBlockProcessed: number,
    toBlock: number,
  ) {
    const events = await this.queryEvents(
      eventName,
      lastBlockProcessed,
      toBlock,
    );

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

      let ticketAddress: string;

      // Retry getting event data from blockchain if needed
      try {
        async function getEventWithRetry(eventId: string, retries = 5) {
          for (let i = 0; i < retries; i++) {
            try {
              const event = await AbiConfig.eventcontract.events(eventId);
              if (event?.ticketAddress) return event;
            } catch (err) {
              console.warn(
                `Retry ${i + 1}/${retries} - Waiting for event(${eventId}) to be available...`,
              );
              if (i === retries - 1) throw err;
              await new Promise((res) => setTimeout(res, 1000)); // wait 1s between retries
            }
          }
        }
        const eventResult = await getEventWithRetry(eventData.eventId);
        ticketAddress = eventResult.ticketAddress;
      } catch (error) {
        console.error('❌ Error fetching ticket address:', error);
        throw new Error('Failed to get ticket address');
      }

      if (!result) {
        console.warn(
          `❌ Transaction info not found for hash: ${transactionHash}`,
        );
        continue;
      }

      const blockchainSnapshot =
        await this.blockchainSnapshotRepository.findOneBy({
          transactionHash,
        });
      async function getEventRecordWithRetry(txHash: string, retries = 5) {
        for (let i = 0; i < retries; i++) {
          const event = await this.eventRepository.findOneBy({
            transactionHash: txHash,
          });
          if (event) return event;
          console.warn(
            `⏳ Retry ${i + 1}/${retries} - Waiting for event(${txHash}) to be available...`,
          );
          await new Promise((res) => setTimeout(res, 1000)); // wait 1s
        }
        return null;
      }
      if (!blockchainSnapshot) {
        // Create new snapshot
        const newSnapshot = this.blockchainSnapshotRepository.create({
          blockNumber: result.blockNumber,
          transactionHash,
          eventName: EventBlockchain.CREATE_EVENT,
          eventData: eventData,
          status:
            result.status === BlockchainSnapshotStatus.SUCCESS
              ? BlockchainSnapshotStatus.SUCCESS
              : BlockchainSnapshotStatus.FAILED,
        });

        await this.blockchainSnapshotRepository.save(newSnapshot);
        const existingEvent = await getEventRecordWithRetry.call(
          this,
          transactionHash,
        );
        if (existingEvent) {
          existingEvent.status = EventStatus.PUBLISHED;
          existingEvent.onChainId = eventData.eventId;
          existingEvent.ticketAddress = ticketAddress;
          await this.eventRepository.save(existingEvent);
        }
      } else {
        // Retry fetching event record in case it's not saved yet

        const existingEvent = await getEventRecordWithRetry.call(
          this,
          transactionHash,
        );

        if (!existingEvent) {
          console.warn(
            `⚠️ No matching event found in DB for tx: ${transactionHash}`,
          );
          continue;
        }

        existingEvent.status = EventStatus.PUBLISHED;
        existingEvent.onChainId = eventData.eventId;
        existingEvent.ticketAddress = ticketAddress;

        await this.eventRepository.save(existingEvent);
        console.log(
          `✅ Event ${existingEvent.id} updated with onChainId & ticketAddress`,
        );
      }
    }
  }

  public async handleTicketSoldEvent(
    eventName: string,
    lastBlockProcessed: number,
    toBlock: number,
  ) {
    const events = await this.queryEvents(
      eventName,
      lastBlockProcessed,
      toBlock,
    );

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
      if (!parsedEventLog) return;
      const [_onchainId, _tierId, _amount, _buyer, _totalPayInUSDT] =
        parsedEventLog.args;

      const blockchainSnapshot =
        await this.blockchainSnapshotRepository.findOneBy({
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

        if ((result.status = BlockchainSnapshotStatus.SUCCESS)) {
          newSnapshot.status = BlockchainSnapshotStatus.SUCCESS;

          const event = await this.eventRepository.findOne({
            where: { onChainId: Number(_onchainId) },
            relations: ['user'],
          });
          console.log('eventaaaaaaaaaaaaaaa', event);
          if (!event || !event.user) {
            // throw new BadRequestException("EventId not found")
            continue;
          } else {
            const user = await this.userRepository.findOneBy({
              id: event.user.id,
            });
            if (!user) {
              throw new BadRequestException('User not found');
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

            const ticketSaleTransaction =
              this.ticketSaleTransactionRepository.create({
                buyerWalletAddress: eventData.sender,
                initialQuantity: eventData.quantity,
                remainingQuantity: eventData.quantity,
                pricePerTicket: eventData.totalPayInUSDT,
                // saleId: saleId,
                transactionHash: transactionHash,
                sellerWalletAddress: user?.walletAddress,
                status: TicketSaleStatus.SELLING,
              });

            if (ticketTierEntity) {
              ticketSaleTransaction.ticketTier = ticketTierEntity;
            }

            await this.blockchainSnapshotRepository.save(newSnapshot);
            const transactionData =
              await this.ticketSaleTransactionRepository.save(
                ticketSaleTransaction,
              );
            const userData = await this.userRepository.findOneBy({
              walletAddress: transactionData.buyerWalletAddress,
            });

            // Check if NFT ticket already exists for this user and ticket tier
            const existingNftTicket = await this.nftTicketRepository.findOne({
              where: {
                owner: { id: userData?.id },
                ticketTier: { id: ticketTier?.id },
              },
            });

            if (existingNftTicket) {
              // If exists, add to existing quantity
              existingNftTicket.quantity += transactionData.initialQuantity;
              await this.nftTicketRepository.save(existingNftTicket);
            } else {
              // If doesn't exist, create new record
              const nftTicketData = {
                owner: { id: userData?.id },
                quantity: transactionData.initialQuantity,
                ticketTier: { id: ticketTier?.id },
              };

              await this.nftTicketRepository.insert(nftTicketData);
            }
          }
        } else {
          newSnapshot.status = BlockchainSnapshotStatus.FAILED;
          await this.blockchainSnapshotRepository.save(newSnapshot);
        }
      }
    }
  }

  public async handleResoldTicketEvent(
    eventName: string,
    lastBlockProcessed: number,
    toBlock: number,
  ) {
    const events = await this.queryEvents(
      eventName,
      lastBlockProcessed,
      toBlock,
    );

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
        const blockchainSnapshot =
          await this.blockchainSnapshotRepository.findOneBy({
            transactionHash,
          });

        if (!blockchainSnapshot) {
          try {
            await this.blockchainSnapshotRepository.manager.transaction(
              async (manager) => {
                const newSnapshot = manager.create(BlockchainSnapshot, {
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
                if (result.status === BlockchainSnapshotStatus.SUCCESS) {
                  //check if ticket sale transaction exists
                  const savedTicketSaleTransaction = await manager.findOne(
                    TicketSaleTransaction,
                    {
                      where: {
                        saleId,
                        transactionHash,
                      },
                    },
                  );

                  //if not -> create ticket sale transaction
                  if (!savedTicketSaleTransaction) {
                    const ticketTierRecord = await manager.findOne(TicketTier, {
                      where: {
                        tierIndex: ticketTier,
                        event: { onChainId: eventId },
                      },
                      relations: ['event'],
                    });

                    if (!ticketTierRecord) {
                      throw new BadRequestException('TicketTier not found');
                    }

                    const ticketSaleTransaction = manager.create(
                      TicketSaleTransaction,
                      {
                        saleId,
                        sellerWalletAddress: seller,
                        transactionHash,
                        pricePerTicket,
                        initialQuantity: initialAmount,
                        remainingQuantity: initialAmount,
                        status: TicketSaleStatus.SELLING,
                        ticketTier: ticketTierRecord,
                      },
                    );
                    await manager.save(ticketSaleTransaction);
                  }
                  //if exists -> update ticket sale transaction and socket to client(optional)
                  else {
                    savedTicketSaleTransaction.pricePerTicket = pricePerTicket;
                    savedTicketSaleTransaction.initialQuantity = initialAmount;
                    savedTicketSaleTransaction.remainingQuantity =
                      initialAmount;
                    savedTicketSaleTransaction.status =
                      TicketSaleStatus.SELLING;
                    await manager.save(savedTicketSaleTransaction);
                  }

                  //update nft ticket
                  const nftTicket = await manager.findOne(NftTicket, {
                    where: {
                      owner: { walletAddress: seller },
                      ticketTier: {
                        tierIndex: ticketTier,
                        event: { onChainId: eventId },
                      },
                    },
                  });

                  if (!nftTicket) {
                    throw new BadRequestException('Something went wrong');
                  }

                  nftTicket.quantity -= initialAmount;
                  if (nftTicket.quantity < 0) {
                    throw new BadRequestException(
                      'Nft ticket quantity is not enough',
                    );
                  }
                  await manager.save(nftTicket);
                } else {
                  await manager.delete(BlockchainSnapshot, { transactionHash });
                }
              },
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }

  public async handleCancelledResellTicketEvent(
    eventName: string,
    lastBlockProcessed: number,
    toBlock: number,
  ) {
    const events = await this.queryEvents(
      eventName,
      lastBlockProcessed,
      toBlock,
    );

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
        const blockchainSnapshot =
          await this.blockchainSnapshotRepository.findOneBy({
            transactionHash,
          });

        if (!blockchainSnapshot) {
          try {
            await this.blockchainSnapshotRepository.manager.transaction(
              async (manager) => {
                const newSnapshot = manager.create(BlockchainSnapshot, {
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

                if (result.status === BlockchainSnapshotStatus.SUCCESS) {
                  const ticketSaleTransaction = await manager.findOne(
                    TicketSaleTransaction,
                    {
                      where: { saleId, sellerWalletAddress: seller },
                      relations: { ticketTier: true },
                    },
                  );

                  if (!ticketSaleTransaction) {
                    throw new BadRequestException(
                      'Ticket sale transaction not found',
                    );
                  }

                  await manager.update(
                    TicketSaleTransaction,
                    { saleId },
                    { status: TicketSaleStatus.CLOSED },
                  );

                  const nftTicket = await manager.findOne(NftTicket, {
                    where: {
                      owner: {
                        walletAddress:
                          ticketSaleTransaction?.sellerWalletAddress,
                      },
                      ticketTier: { id: ticketSaleTransaction?.ticketTier.id },
                    },
                  });

                  await manager.update(
                    NftTicket,
                    { id: nftTicket?.id },
                    {
                      quantity: () =>
                        `quantity + ${ticketSaleTransaction?.remainingQuantity}`,
                    },
                  );
                }
              },
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }

  public async handleBoughtTicketEvent(
    eventName: string,
    lastBlockProcessed: number,
    toBlock: number,
  ) {
    const events = await this.queryEvents(
      eventName,
      lastBlockProcessed,
      toBlock,
    );

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
        const blockchainSnapshot =
          await this.blockchainSnapshotRepository.findOneBy({
            transactionHash,
          });

        if (!blockchainSnapshot) {
          try {
            await this.blockchainSnapshotRepository.manager.transaction(
              async (manager) => {
                //create new blockchain snapshot
                const newBlockchainSnapshot = manager.create(
                  BlockchainSnapshot,
                  {
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
                  },
                );
                await manager.save(newBlockchainSnapshot);

                //if status = failed -> delete pending ticket resale transaction
                if (result.status === BlockchainSnapshotStatus.FAILED) {
                  await manager.delete(TicketSaleTransaction, {
                    transactionHash,
                    buyerWalletAddress: buyer,
                  });

                  //if status = success -> update ticket resale transaction -> create new ticket sale transaction -> update nft ticket
                } else {
                  //update ticket resale transaction
                  const savedTicketSaleTransaction = await manager.findOne(
                    TicketSaleTransaction,
                    {
                      where: {
                        saleId,
                      },
                      relations: {
                        ticketTier: true,
                      },
                    },
                  );

                  if (!savedTicketSaleTransaction) {
                    throw new BadRequestException(
                      'Ticket sale transaction not found',
                    );
                  }

                  savedTicketSaleTransaction.remainingQuantity -= amount;
                  if (savedTicketSaleTransaction.remainingQuantity === 0) {
                    savedTicketSaleTransaction.status = TicketSaleStatus.SOLD;
                  }
                  await manager.save(savedTicketSaleTransaction);

                  //create new ticket sale transaction
                  const pendingTicketSaleTransaction = await manager.findOne(
                    TicketSaleTransaction,
                    {
                      where: {
                        transactionHash,
                      },
                    },
                  );

                  if (pendingTicketSaleTransaction) {
                    pendingTicketSaleTransaction.status = TicketSaleStatus.SOLD;
                    await manager.save(pendingTicketSaleTransaction);
                    console.log(
                      'pendingTicketSaleTransaction',
                      pendingTicketSaleTransaction,
                    );
                  } else {
                    const newTicketSaleTransaction = manager.create(
                      TicketSaleTransaction,
                      {
                        sellerWalletAddress:
                          savedTicketSaleTransaction.sellerWalletAddress,
                        buyerWalletAddress: buyer,
                        transactionHash,
                        pricePerTicket:
                          savedTicketSaleTransaction.pricePerTicket,
                        initialQuantity: amount,
                        status: TicketSaleStatus.SOLD,
                        ticketTier: {
                          id: savedTicketSaleTransaction.ticketTier.id,
                        },
                      },
                    );
                    await manager.save(newTicketSaleTransaction);
                    console.log(
                      'newTicketSaleTransaction',
                      newTicketSaleTransaction,
                    );
                  }

                  //update nft ticket
                  const savedNftTicket = await manager.findOne(NftTicket, {
                    where: {
                      owner: { walletAddress: buyer },
                      ticketTier: {
                        id: savedTicketSaleTransaction.ticketTier.id,
                      },
                    },
                  });
                  if (!savedNftTicket) {
                    const user = await manager.findOne(User, {
                      where: { walletAddress: buyer },
                    });
                    if (!user) {
                      throw new BadRequestException('User not found');
                    }
                    const newNftTicket = manager.create(NftTicket, {
                      owner: user,
                      ticketTier: {
                        id: savedTicketSaleTransaction.ticketTier.id,
                      },
                      quantity: amount,
                    });
                    await manager.save(newNftTicket);
                  } else {
                    savedNftTicket.quantity += amount;
                    await manager.save(savedNftTicket);
                  }
                }
              },
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }

  async queryEvents(eventName: string, fromBlock: number, toBlock: number) {
    // Ensure we're not querying more than 500 blocks at once
    if (toBlock - fromBlock > 500) {
      toBlock = fromBlock + 500;
    }

    try {
      switch (eventName) {
        case EventBlockchain.CREATE_EVENT:
          return await AbiConfig.eventcontract.queryFilter(
            eventName,
            fromBlock,
            toBlock,
          );
        case EventBlockchain.TICKET_SOLD:
          return await AbiConfig.ticketcontract.queryFilter(
            eventName,
            fromBlock,
            toBlock,
          );
        case EventBlockchain.RESOLE_TICKET:
          return await AbiConfig.marketplacecontract.queryFilter(
            eventName,
            fromBlock,
            toBlock,
          );
        case EventBlockchain.CANCELLED_RESELL_TICKET:
          return await AbiConfig.marketplacecontract.queryFilter(
            eventName,
            fromBlock,
            toBlock,
          );
        case EventBlockchain.BOUGHT_TICKET:
          return await AbiConfig.marketplacecontract.queryFilter(
            eventName,
            fromBlock,
            toBlock,
          );
      }
    } catch (error) {
      this.logger.error(
        `Error querying events from block ${fromBlock} to ${toBlock}: ${error.message}`,
      );
      throw error;
    }
  }
  async getTransactionInfo(txHash: string) {
    try {
      const tx = await AbiConfig.provider.getTransaction(txHash);
      const receipt = await AbiConfig.provider.getTransactionReceipt(txHash);

      return {
        transaction: tx,
        receipt: receipt,
        status:
          receipt?.status === 1
            ? BlockchainSnapshotStatus.SUCCESS
            : BlockchainSnapshotStatus.FAILED,
        gasUsed: receipt?.gasUsed.toString(),
        blockNumber: receipt?.blockNumber,
        events: receipt?.logs,
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }
}
