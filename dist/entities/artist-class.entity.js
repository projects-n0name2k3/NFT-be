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
exports.ArtistClass = void 0;
const baseEntity_1 = require("./baseEntity");
const typeorm_1 = require("typeorm");
const artist_entity_1 = require("./artist.entity");
const event_entity_1 = require("./event.entity");
let ArtistClass = class ArtistClass extends baseEntity_1.BaseEntity {
    name;
    royaltyPercentage;
    event;
    artists;
};
exports.ArtistClass = ArtistClass;
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ArtistClass.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'royalty_percent',
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: false,
    }),
    __metadata("design:type", Number)
], ArtistClass.prototype, "royaltyPercentage", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.id),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], ArtistClass.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => artist_entity_1.Artist, (artist) => artist.artistClass),
    __metadata("design:type", Array)
], ArtistClass.prototype, "artists", void 0);
exports.ArtistClass = ArtistClass = __decorate([
    (0, typeorm_1.Entity)('artist_classes')
], ArtistClass);
//# sourceMappingURL=artist-class.entity.js.map