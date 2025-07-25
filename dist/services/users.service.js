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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const files_service_1 = require("./files.service");
const swagger_1 = require("@nestjs/swagger");
let UsersService = class UsersService {
    userRepository;
    filesService;
    constructor(userRepository, filesService) {
        this.userRepository = userRepository;
        this.filesService = filesService;
    }
    async updateUser(tokenPayload, files = {}, name) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: tokenPayload.userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const [coverPhotoUrl, thumbnailUrl] = await Promise.all([
                files.coverPhotoImage &&
                    (await this.filesService.uploadImage(files.coverPhotoImage[0])),
                files.thumbnailImage &&
                    (await this.filesService.uploadImage(files.thumbnailImage[0])),
            ]);
            user.coverPhotoUrl = coverPhotoUrl || user.coverPhotoUrl;
            user.thumbnailUrl = thumbnailUrl || user.thumbnailUrl;
            user.name = name || user.name;
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        }
        catch (error) {
            console.log(error);
            throw new common_1.InternalServerErrorException('Failed to update user');
        }
    }
    async getUserProfile(user) {
        const userProfile = await this.userRepository.findOne({
            where: { id: user.userId },
        });
        if (!userProfile) {
            throw new common_1.NotFoundException('User not found');
        }
        return userProfile;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        files_service_1.FilesService])
], UsersService);
//# sourceMappingURL=users.service.js.map