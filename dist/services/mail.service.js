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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let MailService = class MailService {
    configService;
    smtpUser;
    smtpPassword;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.smtpUser = this.configService.getOrThrow('SMTP_USER');
        this.smtpPassword = this.configService.getOrThrow('SMTP_PASSWORD');
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.smtpUser,
                pass: this.smtpPassword,
            },
        });
    }
    async sendEmail(subject, html, email) {
        try {
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_USER'),
                to: email,
                subject: subject,
                html: html,
            });
            return;
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map