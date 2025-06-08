import { PipeTransform } from '@nestjs/common';
export declare class UpdateProfileFileValidationPipe implements PipeTransform {
    private readonly allowedMimeTypes;
    private readonly maxSize;
    constructor(allowedMimeTypes?: string[], maxSize?: number);
    transform(files: {
        coverPhotoImage?: Express.Multer.File[];
        thumbnailImage?: Express.Multer.File[];
    }): {
        coverPhotoImage?: Express.Multer.File[];
        thumbnailImage?: Express.Multer.File[];
    };
}
