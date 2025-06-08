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
exports.OrganizersController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../services");
const user_decorator_1 = require("../common/decorators/user.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const platform_express_1 = require("@nestjs/platform-express");
const dto_1 = require("../dto");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
const role_guard_1 = require("../common/guards/role.guard");
const role_decorator_1 = require("../common/decorators/role.decorator");
const user_entity_1 = require("../entities/user.entity");
const update_profile_file_validation_pipe_1 = require("../common/pipes/update-profile-file-validation.pipe");
let OrganizersController = class OrganizersController {
    organizerDetailsService;
    constructor(organizerDetailsService) {
        this.organizerDetailsService = organizerDetailsService;
    }
    async updateOrganizerInformation(user, files, payload) {
        const { updatedUser, updatedOrganizerDetail } = await this.organizerDetailsService.updateOrganizerInformation(user, files, payload);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Updated organizer information successfully.',
            data: { user: { ...updatedUser, ...updatedOrganizerDetail } },
        };
    }
    async getOrganizerProfile(user) {
        const organizerProfile = await this.organizerDetailsService.getOrganizerProfile(user);
        return {
            status: common_1.HttpStatus.OK,
            message: 'Get organizer profile successfully.',
            data: { user: organizerProfile },
        };
    }
};
exports.OrganizersController = OrganizersController;
__decorate([
    (0, swagger_2.ApiOperation)({ summary: 'Update organizer information' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Updated organizer information successfully.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                coverPhotoImage: { type: 'buffer' },
                thumbnailImage: { type: 'buffer' },
                phoneNumber: { type: 'string' },
                bio: { type: 'string' },
                facebookLink: { type: 'string' },
                telegramLink: { type: 'string' },
                instagramLink: { type: 'string' },
                xLink: { type: 'string' },
                discordLink: { type: 'string' },
                websiteLink: { type: 'string' },
                name: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Unprocessable Entity',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Updated organizer information successfully.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Organizer detail not found',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, common_1.Put)('profile'),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'coverPhotoImage', maxCount: 1 },
        {
            name: 'thumbnailImage',
            maxCount: 1,
        },
    ])),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.UploadedFiles)(new update_profile_file_validation_pipe_1.UpdateProfileFileValidationPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto, Object, dto_1.UpdateOrganizerDto]),
    __metadata("design:returntype", Promise)
], OrganizersController.prototype, "updateOrganizerInformation", null);
__decorate([
    (0, swagger_2.ApiOperation)({ summary: 'Get organizer profile' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Get organizer profile successfully.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Organizer not found',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, common_1.Get)('profile'),
    (0, role_decorator_1.Role)(user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TokenPayloadDto]),
    __metadata("design:returntype", Promise)
], OrganizersController.prototype, "getOrganizerProfile", null);
exports.OrganizersController = OrganizersController = __decorate([
    (0, swagger_2.ApiTags)('Organizers'),
    (0, common_1.Controller)('organizers'),
    __metadata("design:paramtypes", [services_1.OrganizerDetailsService])
], OrganizersController);
//# sourceMappingURL=organizers.controller.js.map