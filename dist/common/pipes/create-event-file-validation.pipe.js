"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventFileValidationPipe = void 0;
const common_1 = require("@nestjs/common");
class CreateEventFileValidationPipe {
    allowedMimeTypes;
    maxSize;
    constructor(allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
    ], maxSize = 5000000) {
        this.allowedMimeTypes = allowedMimeTypes;
        this.maxSize = maxSize;
    }
    transform(files) {
        if (!files || !files.thumbnailFile || !files.coverPhotoFile || !files.seatmapFile) {
            throw new common_1.BadRequestException("thumbnailFile, coverPhotoFile, seatmapFile is required");
        }
        const validateFile = (file, fieldName) => {
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.UnprocessableEntityException(`Invalid file type for ${fieldName}`);
            }
            if (file.size > this.maxSize) {
                throw new common_1.UnprocessableEntityException(`File size for ${fieldName} is too large`);
            }
        };
        if (files.thumbnailFile) {
            validateFile(files.thumbnailFile[0], 'thumbnailFile');
        }
        if (files.coverPhotoFile) {
            validateFile(files.coverPhotoFile[0], 'coverPhotoFile');
        }
        if (files.seatmapFile) {
            validateFile(files.seatmapFile[0], 'seatmapFile');
        }
        return files;
    }
}
exports.CreateEventFileValidationPipe = CreateEventFileValidationPipe;
//# sourceMappingURL=create-event-file-validation.pipe.js.map