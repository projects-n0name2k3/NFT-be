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
exports.UpdateOrganizerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class UpdateOrganizerDto {
    phoneNumber;
    bio;
    facebookLink;
    telegramLink;
    instagramLink;
    xLink;
    discordLink;
    websiteLink;
    name;
}
exports.UpdateOrganizerDto = UpdateOrganizerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The phone number of the organizer',
        example: '+1234567890',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The bio of the organizer',
        example: 'I am a organizer',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The facebook link of the organizer',
        example: 'https://www.facebook.com/organizer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "facebookLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The telegram link of the organizer',
        example: 'https://t.me/organizer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "telegramLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The instagram link of the organizer',
        example: 'https://www.instagram.com/organizer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "instagramLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The x link of the organizer',
        example: 'https://x.com/organizer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "xLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The discord link of the organizer',
        example: 'https://discord.com/organizer',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "discordLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The website link of the organizer',
        example: 'https://www.organizer.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "websiteLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the organizer',
        example: 'Organizer',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateOrganizerDto.prototype, "name", void 0);
//# sourceMappingURL=update-organizer.dto.js.map