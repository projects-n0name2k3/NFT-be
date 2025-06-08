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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const abi_config_1 = require("../config/abi.config");
let SCService = class SCService {
    configService;
    provider;
    wallet;
    eventManagementContract;
    ticketManagementContract;
    constructor(configService) {
        this.configService = configService;
        this.provider = new ethers_1.ethers.JsonRpcProvider(configService.getOrThrow('RPC_URL'));
        this.wallet = new ethers_1.ethers.Wallet(configService.getOrThrow('METAMASK_PRIVATE_KEY'), this.provider);
        this.eventManagementContract = new ethers_1.ethers.Contract(configService.getOrThrow('EVENT_MANAGEMENT_CONTRACT_ADDRESS'), abi_config_1.AbiConfig.abiEvent, this.wallet);
        this.ticketManagementContract = new ethers_1.ethers.Contract(configService.getOrThrow('TICKET_MANAGEMENT_CONTRACT_ADDRESS'), abi_config_1.AbiConfig.ticketEvent, this.wallet);
    }
    async addOrganizerWalletAddressToWhitelist(walletAddress) {
        const tx = await this.eventManagementContract.addToWhitelist(walletAddress);
        await tx.wait();
    }
    async getRemainingTickets(eventId, tierId) {
        const remainingTickets = await this.ticketManagementContract.tierMap(eventId, tierId);
        const remainingTicketsArray = Object.values(remainingTickets);
        return Number(remainingTicketsArray[3]);
    }
};
exports.SCService = SCService;
exports.SCService = SCService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SCService);
//# sourceMappingURL=sc.service.js.map