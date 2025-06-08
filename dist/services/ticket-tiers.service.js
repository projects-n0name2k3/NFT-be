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
exports.TicketTiersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const sc_service_1 = require("../services/sc.service");
const typeorm_2 = require("typeorm");
let TicketTiersService = class TicketTiersService {
    scService;
    ticketTierRepository;
    eventRepository;
    ticketSaleTransactionRepository;
    constructor(scService, ticketTierRepository, eventRepository, ticketSaleTransactionRepository) {
        this.scService = scService;
        this.ticketTierRepository = ticketTierRepository;
        this.eventRepository = eventRepository;
        this.ticketSaleTransactionRepository = ticketSaleTransactionRepository;
    }
    async getTicketTierDetails(tierId) {
        const ticketTier = await this.ticketTierRepository.findOne({
            where: { id: tierId },
            relations: ['event'],
        });
        if (!ticketTier) {
            throw new common_1.NotFoundException('Ticket tier not found');
        }
        const quantity = await this.scService.getRemainingTickets(ticketTier.event.onChainId, ticketTier.tierIndex);
        return {
            ...ticketTier,
            availableSupply: quantity,
        };
    }
    async createTicketTiers(eventId, ticketTierDto) {
        console.log(ticketTierDto);
        const ticketTiers = [];
        for (let i = 0; i < ticketTierDto.length; i++) {
            let ticketTierInput = this.ticketTierRepository.create({
                name: ticketTierDto[i].name,
                price: ticketTierDto[i].price,
                royaltyPercentage: ticketTierDto[i].royaltyTicketTier,
                availableSupply: ticketTierDto[i].quantity,
                totalSupply: ticketTierDto[i].quantity,
                maxResalePrice: ticketTierDto[i].maxResalePrice,
                minResalePrice: ticketTierDto[i].minResalePrice,
                event: { id: eventId },
                description: ticketTierDto[i].description,
            });
            ticketTiers.push(ticketTierInput);
        }
        const ticketData = await this.ticketTierRepository.save(ticketTiers);
        return ticketData;
    }
    async deleteTicketTiers(eventId) {
        const ticketTiers = await this.ticketTierRepository.find({
            where: { event: { id: eventId } },
        });
        if (!ticketTiers) {
            return;
        }
        await Promise.all(ticketTiers.map((ticketTier) => {
            this.ticketTierRepository.delete(ticketTier.id);
        }));
    }
    async updateTierIndex(tierId, tierIndex) {
        console.log(tierId, tierIndex);
        await this.ticketTierRepository.update(tierId, {
            tierIndex,
        });
        return this.ticketTierRepository.findOne({
            where: { id: tierId },
        });
    }
};
exports.TicketTiersService = TicketTiersService;
exports.TicketTiersService = TicketTiersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.TicketTier)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Event)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.TicketSaleTransaction)),
    __metadata("design:paramtypes", [sc_service_1.SCService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TicketTiersService);
//# sourceMappingURL=ticket-tiers.service.js.map