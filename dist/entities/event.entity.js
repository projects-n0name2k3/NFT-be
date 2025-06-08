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
exports.Event = exports.EventStatus = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
const ticket_tier_entity_1 = require("./ticket-tier.entity");
const user_entity_1 = require("./user.entity");
const artist_class_entity_1 = require("./artist-class.entity");
const action_log_entity_1 = require("./action-log.entity");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "draft";
    EventStatus["PUBLISHED"] = "published";
    EventStatus["PENDING"] = "pending";
    EventStatus["CANCELLED"] = "cancelled";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
let Event = class Event extends baseEntity_1.BaseEntity {
    onChainId;
    user;
    transactionHash;
    thumbnailUrl;
    coverPhotoUrl;
    name;
    venue;
    sellStartDate;
    sellEndDate;
    eventStartDate;
    eventEndDate;
    description;
    status;
    seatmapUrl;
    location;
    eventMetadataUrl;
    ticketMetadataUrl;
    searchVector;
    ticketAddress;
    maxPerUser;
    artistClasses;
    actionsLogs;
    ticketTiers;
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'on_chain_id', type: 'bigint', unique: true, nullable: true }),
    __metadata("design:type", Number)
], Event.prototype, "onChainId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_id' }),
    __metadata("design:type", user_entity_1.User)
], Event.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'transaction_hash', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url', nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cover_photo_url', nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "coverPhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sell_start_date', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Event.prototype, "sellStartDate", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'sell_end_date', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Event.prototype, "sellEndDate", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'event_start_date', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Event.prototype, "eventStartDate", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'event_end_date', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Event.prototype, "eventEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'enum', enum: EventStatus, nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seatmap_url', nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "seatmapUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_metadata_url', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "eventMetadataUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ticket_metadata_url', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "ticketMetadataUrl", void 0);
__decorate([
    (0, typeorm_1.Index)('search_vector_idx'),
    (0, typeorm_1.Column)({
        type: 'tsvector',
        name: 'search_vector',
        generatedType: 'STORED',
        asExpression: "to_tsvector('simple', name)",
        nullable: true,
    }),
    __metadata("design:type", String)
], Event.prototype, "searchVector", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ticket_address', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "ticketAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_per_user', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Event.prototype, "maxPerUser", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => artist_class_entity_1.ArtistClass, (artistClass) => artistClass.event),
    __metadata("design:type", Array)
], Event.prototype, "artistClasses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => action_log_entity_1.ActionLog, (actionLog) => actionLog.event),
    __metadata("design:type", Array)
], Event.prototype, "actionsLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_tier_entity_1.TicketTier, (ticketTier) => ticketTier.event),
    __metadata("design:type", Array)
], Event.prototype, "ticketTiers", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)('events')
], Event);
//# sourceMappingURL=event.entity.js.map