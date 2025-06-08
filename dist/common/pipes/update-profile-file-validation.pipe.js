"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileFileValidationPipe = void 0;
const common_1 = require("@nestjs/common");
class UpdateProfileFileValidationPipe {
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
        if (!files || (!files.coverPhotoImage && !files.thumbnailImage)) {
            return files;
        }
        const validateFile = (file, fieldName) => {
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.UnprocessableEntityException(`Invalid file type for ${fieldName}`);
            }
            if (file.size > this.maxSize) {
                throw new common_1.UnprocessableEntityException(`File size for ${fieldName} is too large`);
            }
        };
        if (files.coverPhotoImage) {
            files.coverPhotoImage.forEach((file) => {
                validateFile(file, 'coverPhotoImage');
            });
        }
        if (files.thumbnailImage) {
            files.thumbnailImage.forEach((file) => {
                validateFile(file, 'thumbnailImage');
            });
        }
        return files;
    }
}
exports.UpdateProfileFileValidationPipe = UpdateProfileFileValidationPipe;
//# sourceMappingURL=update-profile-file-validation.pipe.js.map