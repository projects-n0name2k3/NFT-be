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
exports.TicketTier = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
const event_entity_1 = require("./event.entity");
const nft_ticket_entity_1 = require("./nft-ticket.entity");
const ticket_sale_transaction_entity_1 = require("./ticket-sale-transaction.entity");
let TicketTier = class TicketTier extends baseEntity_1.BaseEntity {
    name;
    price;
    totalSupply;
    availableSupply;
    maxResalePrice;
    minResalePrice;
    royaltyPercentage;
    tierIndex;
    description;
    event;
    nftTickets;
    ticketSaleTransactions;
};
exports.TicketTier = TicketTier;
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], TicketTier.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', nullable: false }),
    __metadata("design:type", Number)
], TicketTier.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_supply', type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], TicketTier.prototype, "totalSupply", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_supply', type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], TicketTier.prototype, "availableSupply", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_resale_price', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], TicketTier.prototype, "maxResalePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_resale_price', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], TicketTier.prototype, "minResalePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'royalty_percentage', type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], TicketTier.prototype, "royaltyPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier_index', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], TicketTier.prototype, "tierIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], TicketTier.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.id),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], TicketTier.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => nft_ticket_entity_1.NftTicket, (nftTicket) => nftTicket.ticketTier),
    __metadata("design:type", Array)
], TicketTier.prototype, "nftTickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_sale_transaction_entity_1.TicketSaleTransaction, (ticketSaleTransaction) => ticketSaleTransaction.ticketTier),
    __metadata("design:type", Array)
], TicketTier.prototype, "ticketSaleTransactions", void 0);
exports.TicketTier = TicketTier = __decorate([
    (0, typeorm_1.Entity)('ticket_tiers')
], TicketTier);
//# sourceMappingURL=ticket-tier.entity.js.map