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
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const FormData = require("form-data");
const config_1 = require("@nestjs/config");
let IpfsService = class IpfsService {
    configService;
    pinataApiUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    pinataJwt;
    httpService;
    constructor(configService) {
        this.configService = configService;
        this.pinataJwt = this.configService.get('PINATA_JWT');
        this.httpService = new axios_1.HttpService();
    }
    async uploadMetadata(metadata) {
        try {
            const metadataJSON = JSON.stringify(metadata);
            const form = new FormData();
            form.append('file', metadataJSON, 'metadata.json');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.pinataApiUrl, form, {
                headers: {
                    Authorization: `Bearer ${this.pinataJwt}`,
                    ...form.getHeaders(),
                },
            }));
            const cid = response.data.IpfsHash;
            return `https://ipfs.io/ipfs/${cid}`;
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('Upload metadata failed');
        }
    }
    async getMetadata(metadataUrl) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(metadataUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
                },
            }));
            return response.data;
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('Get metadata failed');
        }
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map