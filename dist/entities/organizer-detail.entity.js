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
exports.OrganizerDetail = void 0;
const baseEntity_1 = require("./baseEntity");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let OrganizerDetail = class OrganizerDetail extends baseEntity_1.BaseEntity {
    email;
    phoneNumber;
    bio;
    facebookLink;
    telegramLink;
    instagramLink;
    xLink;
    discordLink;
    websiteLink;
    user;
};
exports.OrganizerDetail = OrganizerDetail;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ unique: true, nullable: false }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'phone_number', length: 10, nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'facebook_link', nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "facebookLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telegram_link', nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "telegramLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'instagram_link', nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "instagramLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'x_link', nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "xLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discord_link', nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "discordLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'website_link', nullable: true }),
    __metadata("design:type", String)
], OrganizerDetail.prototype, "websiteLink", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_id' }),
    __metadata("design:type", user_entity_1.User)
], OrganizerDetail.prototype, "user", void 0);
exports.OrganizerDetail = OrganizerDetail = __decorate([
    (0, typeorm_1.Entity)('organizer_details')
], OrganizerDetail);
//# sourceMappingURL=organizer-detail.entity.js.map