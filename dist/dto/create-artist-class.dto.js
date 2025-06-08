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
exports.ArtistClassDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_artist_dto_1 = require("./create-artist.dto");
class ArtistClassDto {
    name;
    royaltyPercent;
    artists;
}
exports.ArtistClassDto = ArtistClassDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'name of ArtistClass is not empty' }),
    (0, class_validator_1.IsString)({ message: 'name of ArtistClass is must be string' }),
    __metadata("design:type", String)
], ArtistClassDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ArtistClassDto.prototype, "royaltyPercent", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_artist_dto_1.ArtistDto),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least 1 artist in artist class' }),
    (0, class_validator_1.IsArray)({ message: 'artists must be an array' }),
    __metadata("design:type", Array)
], ArtistClassDto.prototype, "artists", void 0);
//# sourceMappingURL=create-artist-class.dto.js.map