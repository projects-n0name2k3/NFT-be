import { UnprocessableEntityException, PipeTransform } from '@nestjs/common';

export class UpdateProfileFileValidationPipe implements PipeTransform {
  constructor(
    private readonly allowedMimeTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ],
    private readonly maxSize: number = 5000000,
  ) {}

  transform(files: {
    coverPhotoImage?: Express.Multer.File[];
    thumbnailImage?: Express.Multer.File[];
  }) {
    if (!files || (!files.coverPhotoImage && !files.thumbnailImage)) {
      return files;
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
