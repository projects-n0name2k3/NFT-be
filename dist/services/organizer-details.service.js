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
exports.OrganizerDetailsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("./users.service");
const entities_1 = require("../entities");
let OrganizerDetailsService = class OrganizerDetailsService {
    organizerDetailRepository;
    usersService;
    constructor(organizerDetailRepository, usersService) {
        this.organizerDetailRepository = organizerDetailRepository;
        this.usersService = usersService;
    }
    async updateOrganizerInformation(user, files, payload) {
        const updatedUser = await this.usersService.updateUser(user, files, payload.name);
        const organizerDetail = await this.organizerDetailRepository.findOne({
            where: {
                user: { id: user.userId },
            },
        });
        if (!organizerDetail) {
            throw new common_1.NotFoundException('Organizer detail not found');
        }
        const { phoneNumber, bio, facebookLink, telegramLink, instagramLink, xLink, discordLink, websiteLink, } = payload;
        organizerDetail.phoneNumber = phoneNumber;
        organizerDetail.bio = bio;
        organizerDetail.facebookLink = facebookLink;
        organizerDetail.telegramLink = telegramLink;
        organizerDetail.instagramLink = instagramLink;
        organizerDetail.xLink = xLink;
        organizerDetail.discordLink = discordLink;
        organizerDetail.websiteLink = websiteLink;
        const updatedOrganizerDetail = await this.organizerDetailRepository.save(organizerDetail);
        return { updatedUser, updatedOrganizerDetail };
    }
    async getOrganizerProfile(user) {
        const organizerProfile = await this.organizerDetailRepository.findOne({
            where: { user: { id: user.userId } },
        });
        if (!organizerProfile) {
            throw new common_1.NotFoundException('Organizer detail not found');
        }
        const userProfile = await this.usersService.getUserProfile(user);
        return { ...organizerProfile, ...userProfile };
    }
};
exports.OrganizerDetailsService = OrganizerDetailsService;
exports.OrganizerDetailsService = OrganizerDetailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.OrganizerDetail)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], OrganizerDetailsService);
//# sourceMappingURL=organizer-details.service.js.map