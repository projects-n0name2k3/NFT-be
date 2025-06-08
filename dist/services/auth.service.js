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
exports.AuthService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const ethers_1 = require("ethers");
const mail_service_1 = require("./mail.service");
const entities_1 = require("../entities");
const user_entity_1 = require("../entities/user.entity");
const sc_service_1 = require("./sc.service");
let AuthService = class AuthService {
    cacheManager;
    jwtService;
    configService;
    mailService;
    scService;
    refreshTokenRepository;
    userRepository;
    organizerDetailRepository;
    accessTokenSecret;
    refreshTokenSecret;
    accessTokenTtl;
    refreshTokenTtl;
    cookieConfig;
    constructor(cacheManager, jwtService, configService, mailService, scService, refreshTokenRepository, userRepository, organizerDetailRepository) {
        this.cacheManager = cacheManager;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.scService = scService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.organizerDetailRepository = organizerDetailRepository;
        this.accessTokenSecret =
            this.configService.getOrThrow('JWT_ACCESS_SECRET');
        this.refreshTokenSecret =
            this.configService.getOrThrow('JWT_REFRESH_SECRET');
        this.accessTokenTtl =
            this.configService.getOrThrow('ACCESS_TOKEN_TTL');
        this.refreshTokenTtl =
            this.configService.getOrThrow('REFRESH_TOKEN_TTL');
        this.cookieConfig = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        };
    }
    async generateNonce() {
        const nonce = (0, uuid_1.v4)();
        await this.cacheManager.set(`nonce:${nonce}`, nonce, this.configService.getOrThrow('NONCE_TTL'));
        return nonce;
    }
    async generateMessage(walletAddress) {
        const nonce = await this.generateNonce();
        const message = `Welcome! To verify ownership of your wallet, please sign this message.\n\nWallet Address: ${walletAddress}\nNonce: ${nonce}\n\nThis request is intended for authentication purposes only and does not initiate any blockchain transaction.\nPlease verify the details carefully before signing.\n\nNote: This message will expire in 2 minutes. Please sign it within this timeframe.`;
        return message;
    }
    async encodeAccessToken(walletAddress, userId, role) {
        try {
            const token = await this.jwtService.signAsync({ walletAddress, userId, role }, { secret: this.accessTokenSecret, expiresIn: this.accessTokenTtl });
            return token;
        }
        catch (error) {
            console.error(error);
            throw new common_1.UnauthorizedException('Unable to generate access token');
        }
    }
    async encodeRefreshToken(walletAddress, userId, role) {
        try {
            const token = await this.jwtService.signAsync({ walletAddress, userId, role }, { secret: this.refreshTokenSecret, expiresIn: this.refreshTokenTtl });
            const refreshToken = await this.refreshTokenRepository.create({
                user: { id: userId },
                token,
                expiredAt: new Date(Date.now() + this.refreshTokenTtl),
            });
            await this.refreshTokenRepository.save(refreshToken);
            return token;
        }
        catch (error) {
            console.error(error);
            throw new common_1.UnauthorizedException('Unable to generate refresh token');
        }
    }
    async decodeRefreshToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.refreshTokenSecret,
            });
            return payload;
        }
        catch (error) {
            console.error(error);
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
    }
    async signOut(req, res) {
        const refreshToken = req.cookies['refresh_token'];
        if (refreshToken) {
            try {
                const payload = await this.decodeRefreshToken(refreshToken);
                await this.refreshTokenRepository.update({ user: { id: payload.userId }, token: refreshToken }, { isRevoked: true });
            }
            catch (error) {
                console.log(error);
            }
        }
        res.clearCookie('access_token', {
            ...this.cookieConfig,
            maxAge: 0,
        });
        res.clearCookie('refresh_token', {
            ...this.cookieConfig,
            maxAge: 0,
        });
        res.json({
            status: common_1.HttpStatus.OK,
            message: 'Logout successfully',
        });
    }
    async refreshToken(req, res) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh Token is required');
        }
        const payload = await this.decodeRefreshToken(refreshToken);
        const storedRefreshToken = await this.refreshTokenRepository.findOne({
            where: {
                user: { id: payload.userId },
                token: refreshToken,
                isRevoked: false,
            },
        });
        if (!storedRefreshToken || storedRefreshToken.expiredAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
        const newAccessToken = await this.encodeAccessToken(payload.walletAddress, payload.userId, payload.role);
        const enableTokenRotation = this.configService.getOrThrow('ENABLE_TOKEN_ROTATION');
        let newRefreshToken;
        if (enableTokenRotation) {
            newRefreshToken = await this.encodeRefreshToken(payload.walletAddress, payload.userId, payload.role);
            await this.refreshTokenRepository.update(storedRefreshToken.id, {
                isRevoked: true,
            });
        }
        res.cookie('access_token', newAccessToken, {
            ...this.cookieConfig,
            maxAge: this.accessTokenTtl,
        });
        if (newRefreshToken) {
            res.cookie('refresh_token', newRefreshToken, {
                ...this.cookieConfig,
                maxAge: this.refreshTokenTtl,
            });
        }
        res.status(common_1.HttpStatus.OK).json({
            status: common_1.HttpStatus.OK,
            message: 'Access token refreshed successfully',
        });
    }
    async verifyUser(body, res) {
        console.log(body);
        let signerAddress = '';
        try {
            signerAddress = (0, ethers_1.verifyMessage)(body.message, body.signature);
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid Signature');
        }
        if (signerAddress.toLowerCase() !== body.walletAddress.toLowerCase()) {
            throw new common_1.BadRequestException('Invalid Signature');
        }
        let user = await this.userRepository.findOne({
            where: { walletAddress: body.walletAddress },
        });
        if (!user) {
            user = this.userRepository.create({
                walletAddress: body.walletAddress,
                thumbnailUrl: '',
                coverPhotoUrl: '',
            });
            await this.userRepository.save(user);
        }
        const accessToken = await this.encodeAccessToken(user.walletAddress, user.id, user.role);
        const refreshToken = await this.encodeRefreshToken(user.walletAddress, user.id, user.role);
        res.cookie('access_token', accessToken, {
            ...this.cookieConfig,
            maxAge: this.accessTokenTtl,
        });
        res.cookie('refresh_token', refreshToken, {
            ...this.cookieConfig,
            maxAge: this.refreshTokenTtl,
        });
        let organizerData = null;
        if (user.role === user_entity_1.UserRole.ORGANIZER) {
            organizerData = await this.organizerDetailRepository.findOne({
                where: { user: { id: user.id } },
            });
        }
        res.status(common_1.HttpStatus.OK).json({
            status: common_1.HttpStatus.OK,
            message: 'Verification successfully',
            data: {
                user: { ...user, ...organizerData },
            },
        });
    }
    async sendOtp(body, res) {
        let user = await this.userRepository.findOne({
            where: { walletAddress: body.walletAddress },
        });
        let organizer = await this.organizerDetailRepository.findOne({
            where: { email: body.email },
        });
        if (organizer) {
            throw new common_1.ConflictException('Email has been used');
        }
        if (user) {
            if (user.role == user_entity_1.UserRole.ORGANIZER) {
                throw new common_1.ConflictException('Wallet address is registerd . Please sign in');
            }
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #333;">🔐 One-Time Password (OTP) Verification</h2>
            <p>Dear user,</p>
            <p>You recently requested a One-Time Password (OTP) to verify your identity. Please use the code below to proceed:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0;">
                ${otp}
            </div>
            <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
            <hr>
            <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>`;
        this.mailService.sendEmail(otp, html, body.email);
        const key = `otp_${body.walletAddress}_${body.email}`;
        await this.cacheManager.del(key);
        await this.cacheManager.set(key, otp, this.configService.getOrThrow('OTP_CACHE_TTL'));
        return res.status(common_1.HttpStatus.OK).json({
            status: common_1.HttpStatus.OK,
            message: 'Sent otp successfully',
        });
    }
    async verifyWalletOrganizer(body, res) {
        const keyStatus = `status_${body.walletAddress}_${body.email}`;
        const isSuccessVerify = await this.cacheManager.get(keyStatus);
        if (true) {
            let user = await this.userRepository.findOne({
                where: { walletAddress: body.walletAddress },
            });
            if (user?.role === user_entity_1.UserRole.USER) {
                let organizer = this.organizerDetailRepository.create({
                    email: body.email,
                    user: { id: user.id },
                });
                await this.organizerDetailRepository.save(organizer);
                user.role = user_entity_1.UserRole.ORGANIZER;
                user = await this.userRepository.save(user);
            }
            else if (!user) {
                user = this.userRepository.create({
                    walletAddress: body.walletAddress,
                    thumbnailUrl: '',
                    coverPhotoUrl: '',
                    role: user_entity_1.UserRole.ORGANIZER,
                });
                const userData = await this.userRepository.save(user);
                const organizer = this.organizerDetailRepository.create({
                    email: body.email,
                    user: { id: userData.id },
                });
                await this.organizerDetailRepository.save(organizer);
            }
            try {
                await this.scService.addOrganizerWalletAddressToWhitelist(body.walletAddress);
            }
            catch (error) {
                console.error(error);
                throw new common_1.InternalServerErrorException('Failed to add organizer to whitelist');
            }
            const accessToken = await this.encodeAccessToken(user.walletAddress, user.id, user_entity_1.UserRole.ORGANIZER);
            const refreshToken = await this.encodeRefreshToken(user.walletAddress, user.id, user_entity_1.UserRole.ORGANIZER);
            res.cookie('access_token', accessToken, {
                ...this.cookieConfig,
                maxAge: this.accessTokenTtl,
            });
            res.cookie('refresh_token', refreshToken, {
                ...this.cookieConfig,
                maxAge: this.refreshTokenTtl,
            });
            const userData = await this.userRepository.findOne({
                where: { walletAddress: body.walletAddress },
            });
            const organizerData = await this.organizerDetailRepository.findOne({
                where: { user: { id: userData?.id } },
            });
            console.log(organizerData);
            return res.status(common_1.HttpStatus.OK).json({
                status: common_1.HttpStatus.OK,
                message: 'Verification wallet successfully',
                data: {
                    user: { ...userData, ...organizerData },
                },
            });
        }
        else {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: common_1.HttpStatus.BAD_REQUEST,
                message: 'Please verify otp',
            });
        }
    }
    async verifyEmail(body, res) {
        try {
            const key = `otp_${body.walletAddress}_${body.email}`;
            const cachedOtp = await this.cacheManager.get(key);
            let isSuccess = false;
            if (cachedOtp === body.code) {
                isSuccess = true;
                res.status(common_1.HttpStatus.OK).json({
                    status: common_1.HttpStatus.OK,
                    message: 'Email is verified successfully',
                });
            }
            else {
                res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid OTP',
                });
            }
            const keyStatus = `status_${body.walletAddress}_${body.email}`;
            await this.cacheManager.del(keyStatus);
            await this.cacheManager.set(keyStatus, isSuccess, this.configService.getOrThrow('OTP_CACHE_TTL'));
            return res;
        }
        catch (error) {
            console.error('Error in verifyEmail:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            });
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.RefreshToken)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.OrganizerDetail)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        sc_service_1.SCService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map