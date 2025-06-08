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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const services_1 = require("../services");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const dto_1 = require("../dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async generateMessage({ walletAddress }) {
        const result = {
            status: common_1.HttpStatus.OK,
            message: 'Generate message successfully',
            data: {
                message: await this.authService.generateMessage(walletAddress),
            },
        };
        return result;
    }
    async logout(req, res) {
        await this.authService.signOut(req, res);
    }
    async refresh(req, res) {
        await this.authService.refreshToken(req, res);
    }
    async verifyUser(body, res) {
        await this.authService.verifyUser(body, res);
    }
    async verifyOrganizer(body, res) {
        await this.authService.verifyWalletOrganizer(body, res);
    }
    async verifyEmail(body, res) {
        await this.authService.verifyEmail(body, res);
    }
    async sendOtp(body, res) {
        await this.authService.sendOtp(body, res);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate a unique message' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message generated successfully',
        schema: {
            example: {
                status: 200,
                message: 'Generate message successfully',
                data: `Welcome! To verify ownership of your wallet, please sign this message.\n\nWallet Address: 0x1234567890abcdef1234567890abcdef12345678\nNonce: bcd02c5e-6f25-4c9a-8c15-4f2f57f7e3d7\n\nThis request is intended for authentication purposes only and does not initiate any blockchain transaction.\nPlease verify the details carefully before signing.\n\nNote: This message will expire in 2 minutes. Please sign it within this timeframe.`,
            },
        },
    }),
    (0, common_1.Get)('message/:walletAddress'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateMessageDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Log out the current user' }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User logged out successfully',
    }),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token' }),
    (0, swagger_1.ApiCookieAuth)('refresh_token'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access token refreshed successfully.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Refresh Token is required - Refresh token is invalid or expired',
    }),
    (0, common_1.Post)('tokens'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify wallet for user role' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verify wallet successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid Signature',
    }),
    (0, common_1.Post)('wallet/user/verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyWalletDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify wallet for organizer role' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verify wallet successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid Signature',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('wallet/organizer/verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyOrganizerDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOrganizer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify email for creating organizer' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verify email successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid OTP',
    }),
    (0, common_1.Post)('email/organizer/verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyEmailDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for creating organizer' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Send OTP successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Email has been used',
    }),
    (0, common_1.Post)('otp/organizer/verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [services_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map