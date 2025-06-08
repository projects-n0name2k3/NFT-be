import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { AbiConfig } from 'src/config/abi.config';

@Injectable()
export class SCService {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly eventManagementContract: ethers.Contract;
  private readonly ticketManagementContract: ethers.Contract;

  constructor(private readonly configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(
      configService.getOrThrow<string>('RPC_URL'),
    );
    this.wallet = new ethers.Wallet(
      configService.getOrThrow<string>('METAMASK_PRIVATE_KEY'),
      this.provider,
    );
    this.eventManagementContract = new ethers.Contract(
      configService.getOrThrow<string>('EVENT_MANAGEMENT_CONTRACT_ADDRESS'),
      AbiConfig.abiEvent,
      this.wallet,
    );
    this.ticketManagementContract = new ethers.Contract(
      configService.getOrThrow<string>('TICKET_MANAGEMENT_CONTRACT_ADDRESS'),
      AbiConfig.ticketEvent,
      this.wallet,
    );
  }

  async addOrganizerWalletAddressToWhitelist(walletAddress: string) {
    const tx = await this.eventManagementContract.addToWhitelist(walletAddress);
    await tx.wait();
  }

  async getRemainingTickets(eventId: number, tierId: number) {
    const remainingTickets = await this.ticketManagementContract.tierMap(
      eventId,
      tierId,
    );
    // The structure is likely a struct with named fields, convert to array and get the 4th element
    const remainingTicketsArray = Object.values(remainingTickets);
    return Number(remainingTicketsArray[3]); // Convert BigInt to Number
  }
}
