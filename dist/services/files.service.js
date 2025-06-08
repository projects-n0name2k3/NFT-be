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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const toStream = require("buffer-to-stream");
let FilesService = class FilesService {
    configService;
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
            api_secret: this.configService.getOrThrow('CLOUNDINARY_API_SECRET'),
        });
    }
    async uploadImage(file) {
        const result = new Promise((resolve, reject) => {
            const upload = cloudinary_1.v2.uploader.upload_stream({
                folder: this.configService.getOrThrow('CLOUNDINARY_FOLDER'),
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            toStream(file.buffer).pipe(upload);
        });
        return (await result).url;
    }
    async deleteImage(url) {
        const publicId = this.extractPublicIdFromUrl(url);
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
        });
    }
    extractPublicIdFromUrl(url) {
        const filename = url
            .split(this.configService.getOrThrow('CLOUNDINARY_FOLDER'))[1]
            .replace('/', '')
            .split('.')[0];
        return `${this.configService.getOrThrow('CLOUNDINARY_FOLDER')}/${filename}`;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map