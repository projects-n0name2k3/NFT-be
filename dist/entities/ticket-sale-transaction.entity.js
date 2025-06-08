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
exports.TicketSaleTransaction = exports.TicketSaleStatus = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
const ticket_tier_entity_1 = require("./ticket-tier.entity");
var TicketSaleStatus;
(function (TicketSaleStatus) {
    TicketSaleStatus["DRAFT"] = "draft";
    TicketSaleStatus["SELLING"] = "selling";
    TicketSaleStatus["SOLD"] = "sold";
    TicketSaleStatus["CLOSED"] = "closed";
    TicketSaleStatus["PENDING"] = "pending";
})(TicketSaleStatus || (exports.TicketSaleStatus = TicketSaleStatus = {}));
let TicketSaleTransaction = class TicketSaleTransaction extends baseEntity_1.BaseEntity {
    saleId;
    sellerWalletAddress;
    buyerWalletAddress;
    transactionHash;
    pricePerTicket;
    initialQuantity;
    remainingQuantity;
    status;
    ticketTier;
};
exports.TicketSaleTransaction = TicketSaleTransaction;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sale_id', type: 'integer', nullable: true, unique: true }),
    __metadata("design:type", Number)
], TicketSaleTransaction.prototype, "saleId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'seller_wallet_address', nullable: false }),
    __metadata("design:type", String)
], TicketSaleTransaction.prototype, "sellerWalletAddress", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'buyer_wallet_address', nullable: true }),
    __metadata("design:type", String)
], TicketSaleTransaction.prototype, "buyerWalletAddress", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'transaction_hash', nullable: false }),
    __metadata("design:type", String)
], TicketSaleTransaction.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_per_ticket', nullable: false, type: 'decimal' }),
    __metadata("design:type", Number)
], TicketSaleTransaction.prototype, "pricePerTicket", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], TicketSaleTransaction.prototype, "initialQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], TicketSaleTransaction.prototype, "remainingQuantity", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        name: 'status',
        nullable: false,
        type: 'enum',
        enum: TicketSaleStatus,
    }),
    __metadata("design:type", String)
], TicketSaleTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => ticket_tier_entity_1.TicketTier, (ticketTier) => ticketTier.id),
    (0, typeorm_1.JoinColumn)({ name: 'tier_id' }),
    __metadata("design:type", ticket_tier_entity_1.TicketTier)
], TicketSaleTransaction.prototype, "ticketTier", void 0);
exports.TicketSaleTransaction = TicketSaleTransaction = __decorate([
    (0, typeorm_1.Entity)('ticket_sale_transactions')
], TicketSaleTransaction);
//# sourceMappingURL=ticket-sale-transaction.entity.js.map