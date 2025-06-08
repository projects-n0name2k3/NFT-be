import { PipeTransform } from '@nestjs/common';
export declare class CreateEventFileValidationPipe implements PipeTransform {
    private readonly allowedMimeTypes;
    private readonly maxSize;
    constructor(allowedMimeTypes?: string[], maxSize?: number);
    transform(files: {
        thumbnailFile?: Express.Multer.File[];
        coverPhotoFile?: Express.Multer.File[];
        seatmapFile?: Express.Multer.File[];
    }): {
        thumbnailFile?: Express.Multer.File[];
        coverPhotoFile?: Express.Multer.File[];
        seatmapFile?: Express.Multer.File[];
    };
}
