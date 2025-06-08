import { BadRequestException, PipeTransform, UnprocessableEntityException } from '@nestjs/common';

export class CreateEventFileValidationPipe implements PipeTransform {
  constructor(
    private readonly allowedMimeTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ],
    private readonly maxSize: number = 5000000,
  ) { }

  transform(files: {
    thumbnailFile?: Express.Multer.File[];
    coverPhotoFile?: Express.Multer.File[];
    seatmapFile?: Express.Multer.File[];
  }) {
    if (!files || !files.thumbnailFile || !files.coverPhotoFile || !files.seatmapFile) {
      throw new BadRequestException("thumbnailFile, coverPhotoFile, seatmapFile is required")
    }

    const validateFile = (file: Express.Multer.File, fieldName: string) => {
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new UnprocessableEntityException(
          `Invalid file type for ${fieldName}`,
        );
      }

      if (file.size > this.maxSize) {
        throw new UnprocessableEntityException(
          `File size for ${fieldName} is too large`,
        );
      }
    };

    if (files.thumbnailFile) { validateFile(files.thumbnailFile[0], 'thumbnailFile'); }
    if (files.coverPhotoFile) { validateFile(files.coverPhotoFile[0], 'coverPhotoFile'); }
    if (files.seatmapFile) { validateFile(files.seatmapFile[0], 'seatmapFile'); }

    return files;
  }
}
