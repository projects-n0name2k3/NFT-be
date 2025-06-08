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
exports.CheckEventCreationStatusDto = void 0;
const class_validator_1 = require("class-validator");
class CheckEventCreationStatusDto {
    transactionHash;
    eventMetadataUrl;
}
exports.CheckEventCreationStatusDto = CheckEventCreationStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, {
        message: 'transactionHash is invalid.',
    }),
    __metadata("design:type", String)
], CheckEventCreationStatusDto.prototype, "transactionHash", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)({}, { message: 'eventMetadataUrl phải là một URL hợp lệ' }),
    (0, class_validator_1.Matches)(/^https:\/\/ipfs\.io\/ipfs\/[a-zA-Z0-9]+$/, {
        message: 'eventMetadataUrl phải có định dạng https://ipfs.io/ipfs/${cid}',
    }),
    __metadata("design:type", String)
], CheckEventCreationStatusDto.prototype, "eventMetadataUrl", void 0);
//# sourceMappingURL=check-event-creation-status.dto.js.map