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
exports.VerifyWalletDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifyWalletDto {
    message;
    signature;
    walletAddress;
}
exports.VerifyWalletDto = VerifyWalletDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Message is required' }),
    (0, class_validator_1.Length)(10, 500, { message: 'Message must be between 10 and 500 characters' }),
    (0, swagger_1.ApiProperty)({
        example: 'Welcome! To verify ownership of your wallet, please sign this message.',
        description: `Messages received by the user`,
    }),
    __metadata("design:type", String)
], VerifyWalletDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Signature is required' }),
    (0, class_validator_1.Length)(65, 132, { message: 'Signature must be a valid signature' }),
    (0, swagger_1.ApiProperty)({
        example: `wvbcruhmtrdziyxhehsfrwduqdtrczfugkmiwwlbdbicouejmtwmxicbjzdrqqcwmtipfzhixczyzdkygmmgqpysfphwbyxtxgrnqrhsjtchwq`,
        description: '',
    }),
    __metadata("design:type", String)
], VerifyWalletDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: `0xD435459d8C01d7C776B2e5C05e87EA289De65391`,
        description: 'wallet address',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Wallet address is required' }),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, {
        message: 'Invalid wallet address',
    }),
    __metadata("design:type", String)
], VerifyWalletDto.prototype, "walletAddress", void 0);
//# sourceMappingURL=validate-wallet.dto.js.map