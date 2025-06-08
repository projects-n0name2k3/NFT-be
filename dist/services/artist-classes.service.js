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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const artist_class_entity_1 = require("../entities/artist-class.entity");
const typeorm_2 = require("typeorm");
let ArtistClassesService = class ArtistClassesService {
    artistClassesRepository;
    artistRepository;
    constructor(artistClassesRepository, artistRepository) {
        this.artistClassesRepository = artistClassesRepository;
        this.artistRepository = artistRepository;
    }
    async createArtistClasses(eventId, artistClassDto) {
        const artists = [];
        for (let i = 0; i < artistClassDto.length; i++) {
            const artistClass = this.artistClassesRepository.create({
                name: artistClassDto[i].name,
                event: { id: eventId },
                royaltyPercentage: artistClassDto[i].royaltyPercent,
            });
            const savedArtistClass = await this.artistClassesRepository.save(artistClass);
            const artistItem = artistClassDto[i].artists;
            for (let artistData of artistItem) {
                const artist = this.artistRepository.create({
                    name: artistData.name,
                    walletAddress: artistData.walletAddress,
                    artistClass: { id: savedArtistClass.id },
                });
                artists.push(artist);
            }
            await this.artistRepository.save(artists);
        }
    }
    async getArtistClasses(eventId) {
        const artistClasses = await this.artistClassesRepository.find({
            where: { event: { id: eventId } },
            select: ['id'],
        });
        const artistClassIds = artistClasses.map((artistClass) => artistClass.id);
        return artistClassIds;
    }
    async deleteArtistClasses(eventId) {
        const artistClasses = await this.artistClassesRepository.find({
            where: { event: { id: eventId } },
        });
        if (!artistClasses) {
            return;
        }
        await Promise.all(artistClasses.map((artistClass) => {
            this.artistClassesRepository.delete(artistClass.id);
        }));
    }
};
exports.ArtistClassesService = ArtistClassesService;
exports.ArtistClassesService = ArtistClassesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(artist_class_entity_1.ArtistClass)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Artist)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ArtistClassesService);
//# sourceMappingURL=artist-classes.service.js.map