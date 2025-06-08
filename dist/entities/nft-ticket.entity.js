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
exports.NftTicket = void 0;
const baseEntity_1 = require("./baseEntity");
const typeorm_1 = require("typeorm");
const ticket_tier_entity_1 = require("./ticket-tier.entity");
const user_entity_1 = require("./user.entity");
let NftTicket = class NftTicket extends baseEntity_1.BaseEntity {
    owner;
    quantity;
    ticketTier;
};
exports.NftTicket = NftTicket;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], NftTicket.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], NftTicket.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_tier_entity_1.TicketTier, (ticketTier) => ticketTier.id),
    (0, typeorm_1.JoinColumn)({ name: 'tier_id' }),
    __metadata("design:type", ticket_tier_entity_1.TicketTier)
], NftTicket.prototype, "ticketTier", void 0);
exports.NftTicket = NftTicket = __decorate([
    (0, typeorm_1.Entity)('nft_tickets')
], NftTicket);
//# sourceMappingURL=nft-ticket.entity.js.map