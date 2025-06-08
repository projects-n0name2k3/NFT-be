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
exports.GetTicketsByTierDto = exports.SortType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var SortType;
(function (SortType) {
    SortType["ASC"] = "asc";
    SortType["DESC"] = "desc";
})(SortType || (exports.SortType = SortType = {}));
class GetTicketsByTierDto {
    page = 1;
    limit = 10;
    get skip() {
        return (this.page - 1) * this.limit;
    }
    sortType = SortType.DESC;
    tierId;
}
exports.GetTicketsByTierDto = GetTicketsByTierDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The page number',
        required: false,
        type: Number,
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetTicketsByTierDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The number of tickets to skip',
        required: false,
        type: Number,
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetTicketsByTierDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of sorting',
        required: false,
        enum: SortType,
    }),
    (0, class_validator_1.IsEnum)(SortType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetTicketsByTierDto.prototype, "sortType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Id of ticket tier',
        required: true,
        type: String,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetTicketsByTierDto.prototype, "tierId", void 0);
//# sourceMappingURL=search-ticket.dto.js.map