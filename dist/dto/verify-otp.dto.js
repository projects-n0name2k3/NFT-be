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
exports.VerifyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifyDto {
    walletAddress;
    email;
}
exports.VerifyDto = VerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x1234567890abcdef1234567890abcdef12345678',
        description: "User's wallet address",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tranngochuy12@gmail.com',
        description: "Email of user",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyDto.prototype, "email", void 0);
//# sourceMappingURL=verify-otp.dto.js.map