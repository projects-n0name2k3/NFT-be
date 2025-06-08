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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("../entities/baseEntity");
const event_entity_1 = require("../entities/event.entity");
const organizer_detail_entity_1 = require("../entities/organizer-detail.entity");
const action_log_entity_1 = require("../entities/action-log.entity");
const ticket_sale_transaction_entity_1 = require("../entities/ticket-sale-transaction.entity");
const nft_ticket_entity_1 = require("../entities/nft-ticket.entity");
const refresh_token_entity_1 = require("../entities/refresh-token.entity");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ORGANIZER"] = "organizer";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User extends baseEntity_1.BaseEntity {
    walletAddress;
    name;
    thumbnailUrl;
    coverPhotoUrl;
    role;
    events;
    organzierDetail;
    actionLogs;
    ticketSellTransactions;
    ticketBuyTransactions;
    nftTickets;
    refreshTokens;
};
exports.User = User;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'wallet_address', unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "walletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Unnamed' }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cover_photo_url', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "coverPhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: UserRole, default: UserRole.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_entity_1.Event, (event) => event.user),
    __metadata("design:type", Array)
], User.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => organizer_detail_entity_1.OrganizerDetail, (organizerDetail) => organizerDetail.user),
    __metadata("design:type", organizer_detail_entity_1.OrganizerDetail)
], User.prototype, "organzierDetail", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => action_log_entity_1.ActionLog, (actionLog) => actionLog.user),
    __metadata("design:type", Array)
], User.prototype, "actionLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_sale_transaction_entity_1.TicketSaleTransaction, (ticketResaleTransaction) => ticketResaleTransaction.sellerWalletAddress),
    __metadata("design:type", Array)
], User.prototype, "ticketSellTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_sale_transaction_entity_1.TicketSaleTransaction, (ticketResaleTransaction) => ticketResaleTransaction.buyerWalletAddress),
    __metadata("design:type", Array)
], User.prototype, "ticketBuyTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => nft_ticket_entity_1.NftTicket, (nftTicket) => nftTicket.owner),
    __metadata("design:type", Array)
], User.prototype, "nftTickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => refresh_token_entity_1.RefreshToken, (refreshToken) => refreshToken.user),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map