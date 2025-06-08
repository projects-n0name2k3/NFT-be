import { ethers, Interface } from 'ethers';
import * as fs from 'fs';
import path from 'path';

class AbiConfig {
  static abiEvent = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../common/abi/abi-event-manager.json'),
      'utf-8',
    ),
  );
  static ticketEvent = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../common/abi/abi-ticket-manager.json'),
      'utf-8',
    ),
  );
  static marketplaceEvent = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../common/abi/abi-marketplace.json'),
      'utf-8',
    ),
  );
  static provider = new ethers.JsonRpcProvider(
    'https://bnb-testnet.g.alchemy.com/v2/fZR0qlgcTJzomS9xLEff1Rp4KClaN00z',
  );
  static eventContractAddress = '0x45CfF129D5f7788FA7Cbfc82fb8803A75372afFF';
  static ticketContractAddress = '0xc1f192E391392d2fF2259Cc0562ad92612B45f3c';
  static marketplaceContractAddress =
    '0xbde24D97f41104C8aa7B763369769e629E81e765';
  static eventcontract = new ethers.Contract(
    AbiConfig.eventContractAddress,
    this.abiEvent,
    this.provider,
  );
  static ticketcontract = new ethers.Contract(
    AbiConfig.ticketContractAddress,
    this.ticketEvent,
    this.provider,
  );
  static marketplacecontract = new ethers.Contract(
    AbiConfig.marketplaceContractAddress,
    this.marketplaceEvent,
    this.provider,
  );
}

export { AbiConfig };
