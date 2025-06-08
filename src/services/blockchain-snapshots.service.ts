import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TokenPayloadDto,
  VerifyBuyResaleTicketStatusDto,
  VerifyResaleCancellationStatusDto,
  VerifyResaleCreationStatusDto,
} from '../dto';
import {
  BlockchainSnapshot,
  TicketTier,
  TicketSaleTransaction,
  NftTicket,
} from '../entities';
import { BlockchainSnapshotStatus } from '../entities/blockchain-snapshot.entity';
import { TicketSaleStatus } from '../entities/ticket-sale-transaction.entity';
import { Repository } from 'typeorm';
import { EventBlockchain } from './blockchain-event-processor.service';

@Injectable()
export class BlockchainSnapshotsService {
  constructor(
    @InjectRepository(BlockchainSnapshot)
    private readonly blockchainSnapshotRepository: Repository<BlockchainSnapshot>,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(TicketSaleTransaction)
    private readonly ticketSaleTransactionRepository: Repository<TicketSaleTransaction>,
  ) {}

  async getTransactionByHash(transactionHash: string) {
    const transaction = await this.blockchainSnapshotRepository.findOne({
      where: { transactionHash },
    });

    return transaction;
  }

  async getLatestBlockFromDb(eventName: EventBlockchain): Promise<number> {
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

  async verifyResaleCreationStatus(
    {
      eventId,
      ticketTier,
      pricePerTicket,
      amount,
      transactionHash,
    }: VerifyResaleCreationStatusDto,
    user: TokenPayloadDto,
  ) {
    //check if ticket tier exists
    const savedTicketTier = await this.ticketTierRepository.findOne({
      where: {
        tierIndex: ticketTier,
        event: { onChainId: eventId },
      },
    });

    if (!savedTicketTier) {
      throw new NotFoundException('Ticket tier not found');
    }

    //check if blockchain snapshot exists
    const savedBlockchainSnapshot =
      await this.blockchainSnapshotRepository.findOne({
        where: { transactionHash },
      });

    //if not -> resale is creating
    if (!savedBlockchainSnapshot) {
      const savedTicketSaleTransaction =
        await this.ticketSaleTransactionRepository.findOne({
          where: [{ transactionHash }],
        });

      if (savedTicketSaleTransaction) {
        return 'pending';
      }

      const draftTicketSaleTransaction =
        this.ticketSaleTransactionRepository.create({
          sellerWalletAddress: user.walletAddress,
          transactionHash,
          pricePerTicket,
          initialQuantity: amount,
          remainingQuantity: amount,
          status: TicketSaleStatus.DRAFT,
          ticketTier: { id: savedTicketTier.id },
        });
      await this.ticketSaleTransactionRepository.save(
        draftTicketSaleTransaction,
      );

      return 'pending';
    }

    //if exist -> update ticket sale transaction and update nft ticket
    else if (
      savedBlockchainSnapshot &&
      savedBlockchainSnapshot.status === BlockchainSnapshotStatus.SUCCESS
    ) {
      return 'success';
    } else {
      return 'failed';
    }
  }

  async verifyResaleCancellationStatus(
    { saleId, transactionHash }: VerifyResaleCancellationStatusDto,
    user: TokenPayloadDto,
  ) {
    console.log(user);
    //check if ticket resale exists
    const savedTicketSaleTransaction =
      await this.ticketSaleTransactionRepository.findOne({
        where: {
          saleId,
          sellerWalletAddress: user.walletAddress,
        },
      });

    //if not -> throw error
    if (!savedTicketSaleTransaction) {
      throw new NotFoundException('Ticket resale not found');
    }

    //if exist and status is cancelled -> return success
    if (savedTicketSaleTransaction.status === TicketSaleStatus.CLOSED) {
      return 'success';
    }

    //check if blockchain snapshot exists
    const savedBlockchainSnapshot =
      await this.blockchainSnapshotRepository.findOne({
        where: {
          transactionHash,
        },
      });

    //if not -> return pending
    if (!savedBlockchainSnapshot) {
      return 'pending';
    }

    //if exist and status is success -> return success
    if (savedBlockchainSnapshot.status === BlockchainSnapshotStatus.SUCCESS) {
      return 'success';
    }

    //if exist and status is failed -> return failed
    return 'failed';
  }

  async verifyBuyResaleTicketStatus(
    { saleId, amount, transactionHash }: VerifyBuyResaleTicketStatusDto,
    user: TokenPayloadDto,
  ) {
    //check if ticket sale transaction exists
    const savedTicketSaleTransaction =
      await this.ticketSaleTransactionRepository.findOne({
        where: {
          saleId,
        },
        relations: {
          ticketTier: true,
        },
      });

    //if not -> throw error
    if (!savedTicketSaleTransaction) {
      throw new NotFoundException('Ticket sale transaction not found');
    }

    //check if blockchain snapshot exists
    const savedBlockchainSnapshot =
      await this.blockchainSnapshotRepository.findOne({
        where: { transactionHash },
      });

    //if not -> return pending
    if (!savedBlockchainSnapshot) {
      //create new ticket sale transaction for this transaction if not exists
      let savedCurrentTicketSaleTransaction =
        await this.ticketSaleTransactionRepository.findOne({
          where: {
            transactionHash,
          },
        });

      if (!savedCurrentTicketSaleTransaction) {
        const currentTicketSaleTransaction =
          this.ticketSaleTransactionRepository.create({
            sellerWalletAddress: savedTicketSaleTransaction.sellerWalletAddress,
            buyerWalletAddress: user.walletAddress,
            transactionHash,
            pricePerTicket: savedTicketSaleTransaction.pricePerTicket,
            initialQuantity: amount,
            status: TicketSaleStatus.PENDING,
            ticketTier: { id: savedTicketSaleTransaction.ticketTier.id },
          });

        await this.ticketSaleTransactionRepository.save(
          currentTicketSaleTransaction,
        );
      }
      return 'pending';
    }

    //if exist and status is success -> return success
    if (savedBlockchainSnapshot.status === BlockchainSnapshotStatus.SUCCESS) {
      return 'success';
    }

    //if exist and status is failed -> return failed
    return 'failed';
  }
}
