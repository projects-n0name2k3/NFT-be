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
exports.VerifyResaleCreationStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifyResaleCreationStatusDto {
    eventId;
    ticketTier;
    pricePerTicket;
    amount;
    transactionHash;
}
exports.VerifyResaleCreationStatusDto = VerifyResaleCreationStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event id',
        type: Number,
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyResaleCreationStatusDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ticket tier',
        type: Number,
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyResaleCreationStatusDto.prototype, "ticketTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price per ticket',
        type: Number,
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyResaleCreationStatusDto.prototype, "pricePerTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount',
        type: Number,
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyResaleCreationStatusDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction hash',
        type: String,
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, {
        message: 'transactionHash is invalid.',
    }),
    __metadata("design:type", String)
], VerifyResaleCreationStatusDto.prototype, "transactionHash", void 0);
//# sourceMappingURL=verify-resale-creation-status.dto.js.map