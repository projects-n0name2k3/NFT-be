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
exports.Artist = void 0;
const baseEntity_1 = require("./baseEntity");
const typeorm_1 = require("typeorm");
const artist_class_entity_1 = require("./artist-class.entity");
let Artist = class Artist extends baseEntity_1.BaseEntity {
    name;
    walletAddress;
    artistClass;
};
exports.Artist = Artist;
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Artist.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_address', nullable: false }),
    __metadata("design:type", String)
], Artist.prototype, "walletAddress", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => artist_class_entity_1.ArtistClass, (artistClass) => artistClass.id),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", artist_class_entity_1.ArtistClass)
], Artist.prototype, "artistClass", void 0);
exports.Artist = Artist = __decorate([
    (0, typeorm_1.Entity)('artists')
], Artist);
//# sourceMappingURL=artist.entity.js.map