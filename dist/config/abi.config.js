"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbiConfig = void 0;
const ethers_1 = require("ethers");
const fs = require("fs");
const nodePath = require("path");
class AbiConfig {
    static abiEvent = JSON.parse(fs.readFileSync(nodePath.join(__dirname, '../common/abi/abi-event-manager.json'), 'utf-8'));
    static ticketEvent = JSON.parse(fs.readFileSync(nodePath.join(__dirname, '../common/abi/abi-sold-ticket-event-manager.json'), 'utf-8'));
    static marketplaceEvent = JSON.parse(fs.readFileSync(nodePath.join(__dirname, '../common/abi/abi-marketplace.json'), 'utf-8'));
    static provider = new ethers_1.ethers.JsonRpcProvider('https://bnb-testnet.g.alchemy.com/v2/fZR0qlgcTJzomS9xLEff1Rp4KClaN00z');
    static eventContractAddress = '0x45CfF129D5f7788FA7Cbfc82fb8803A75372afFF';
    static ticketContractAddress = '0xc1f192E391392d2fF2259Cc0562ad92612B45f3c';
    static marketplaceContractAddress = '0xbde24D97f41104C8aa7B763369769e629E81e765';
    static eventcontract = new ethers_1.ethers.Contract(AbiConfig.eventContractAddress, this.abiEvent, this.provider);
    static ticketcontract = new ethers_1.ethers.Contract(AbiConfig.ticketContractAddress, this.ticketEvent, this.provider);
    static marketplacecontract = new ethers_1.ethers.Contract(AbiConfig.marketplaceContractAddress, this.marketplaceEvent, this.provider);
}
exports.AbiConfig = AbiConfig;
//# sourceMappingURL=abi.config.js.map